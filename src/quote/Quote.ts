import { AxiosError, AxiosRequestConfig } from 'axios';

import productTypes from '../../generated/product-types.json';
import products from '../../generated/products.json';
import { ProductTypes } from '../../generated/types';
import {
  CoverAsset,
  CoverId,
  DEFAULT_COMMISSION_RATIO,
  DEFAULT_SLIPPAGE,
  MAXIMUM_COVER_PERIOD,
  MINIMUM_COVER_PERIOD,
  NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  SLIPPAGE_DENOMINATOR,
  TARGET_PRICE_DENOMINATOR,
} from '../constants/cover';
import { Cover } from '../cover/Cover';
import { Ipfs } from '../ipfs/Ipfs';
import { NexusSDKBase } from '../nexus-sdk-base';
import {
  CoverRouterProductCapacityResponse,
  CoverRouterQuoteResponse,
  ErrorApiResponse,
  GetQuoteApiResponse,
  GetQuoteResponse,
} from '../types';
import { IPFS_CONTENT_TYPE_BY_PRODUCT_TYPE, IPFSTypeContentTuple } from '../types/ipfs';
import { GetQuoteAndBuyCoverInputsParams, NexusSDKConfig } from '../types/sdk';

type ProductDTO = Omit<(typeof products)[number], 'productType'> & {
  productType: ProductTypes;
};

const productsMap: Record<number, ProductDTO> = products.reduce(
  (acc, product) => ({ ...acc, [product.id]: product }),
  {},
);

/**
 * Class for handling quote-related functionality
 */
export class Quote extends NexusSDKBase {
  private cover: Cover;
  private ipfs: Ipfs;

  /**
   * Create a new Quote instance
   * @param config SDK configuration
   * @param cover Cover instance for calculations
   * @param ipfs IPFS instance for content upload and validation
   */
  constructor(config: NexusSDKConfig = {}, cover?: Cover, ipfs?: Ipfs) {
    super(config);
    this.cover = cover || new Cover();
    this.ipfs = ipfs || new Ipfs(config);
  }

  /**
   * Get quote and buy cover inputs
   * @param params Parameters for the quote
   * @returns Quote and buy cover inputs
   */
  public async getQuoteAndBuyCoverInputs(
    params: GetQuoteAndBuyCoverInputsParams,
  ): Promise<GetQuoteApiResponse | ErrorApiResponse> {
    const {
      productId,
      coverAmount,
      coverPeriod,
      coverAsset,
      coverBuyerAddress,
      slippage = DEFAULT_SLIPPAGE / SLIPPAGE_DENOMINATOR,
      ipfsCidOrContent = '',
    } = params;

    // Cast coverAsset to the proper enum type
    const coverAssetEnum = coverAsset as unknown as CoverAsset;

    if (!Number.isInteger(productId) || productId <= 0) {
      return { result: undefined, error: { message: 'Invalid productId: must be a positive integer' } };
    }

    if (typeof coverAmount !== 'string' || !/^\d+$/.test(coverAmount) || parseInt(coverAmount, 10) <= 0) {
      return { result: undefined, error: { message: 'Invalid coverAmount: must be a positive integer string' } };
    }

    if (!Number.isInteger(coverPeriod) || coverPeriod < MINIMUM_COVER_PERIOD || coverPeriod > MAXIMUM_COVER_PERIOD) {
      return {
        result: undefined,
        error: {
          message: `Invalid coverPeriod: must be between ${MINIMUM_COVER_PERIOD} and ${MAXIMUM_COVER_PERIOD} days`,
        },
      };
    }

    const coverAssetsString = Object.keys(CoverAsset)
      .filter(k => isNaN(+k))
      .map(k => `CoverAsset.${k}`)
      .join(', ');

    if (!Object.values(CoverAsset).includes(coverAssetEnum)) {
      return {
        result: undefined,
        error: { message: `Invalid coverAsset: must be one of ${coverAssetsString}` },
      };
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(coverBuyerAddress)) {
      return { result: undefined, error: { message: 'Invalid coverBuyerAddress: must be a valid Ethereum address' } };
    }

    if (typeof slippage !== 'number' || slippage < 0 || slippage > 1) {
      return {
        result: undefined,
        error: { message: 'Invalid slippage: must be a number between 0 and 1' },
      };
    }

    // Handle ipfsCidOrContent validation (either a string CID or a content object)
    const isString = typeof ipfsCidOrContent === 'string';
    const isObject = typeof ipfsCidOrContent === 'object' && ipfsCidOrContent !== null;

    if (!isString && !isObject) {
      return {
        result: undefined,
        error: { message: 'Invalid ipfsCidOrContent: must be a string CID or content object' },
      };
    }

    if (isString && ipfsCidOrContent !== '') {
      const isValidCID = this.ipfs.validateIPFSCid(ipfsCidOrContent as string);
      if (!isValidCID) {
        return {
          result: undefined,
          error: { message: 'Invalid ipfsCid: must be a valid IPFS CID' },
        };
      }
    }

    const productType = productsMap[productId]?.productType;
    if (productType === undefined) {
      return {
        result: undefined,
        error: { message: `Invalid product` },
      };
    }

    if (IPFS_CONTENT_TYPE_BY_PRODUCT_TYPE[productType] !== undefined && !ipfsCidOrContent) {
      return {
        result: undefined,
        error: {
          message: `Missing IPFS content. \n
          ${productTypes[productType]?.name} requires ${IPFS_CONTENT_TYPE_BY_PRODUCT_TYPE[productType]} content type.`,
        },
      };
    }

    let ipfsData = ipfsCidOrContent as string;
    const contentType = IPFS_CONTENT_TYPE_BY_PRODUCT_TYPE[productType];

    // Handle uploading content to IPFS if provided as an object
    if (!isString && contentType !== undefined && ipfsCidOrContent) {
      try {
        // Use the IPFS instance to upload content
        ipfsData = await this.ipfs.uploadIPFSContent([contentType, ipfsCidOrContent] as IPFSTypeContentTuple);
      } catch (error: unknown) {
        return {
          result: undefined,
          error: { message: (error as Error).message || 'Failed to upload IPFS content' },
        };
      }
    }

    // Convert slippage from 0-1 to 0-100_00
    const slippageValue = slippage * SLIPPAGE_DENOMINATOR;

    try {
      // Get quote using helper method
      const { quote } = await this.getQuote(productId, coverAmount, coverPeriod, coverAssetEnum);

      const maxPremiumInAsset = this.cover.calculatePremiumWithCommissionAndSlippage(
        BigInt(quote.premiumInAsset),
        DEFAULT_COMMISSION_RATIO,
        slippageValue,
      );
      const yearlyCostPerc = this.cover.calculatePremiumWithCommissionAndSlippage(
        BigInt(quote.annualPrice),
        DEFAULT_COMMISSION_RATIO,
        slippageValue,
      );

      // Get product capacity using helper method
      const maxCapacity = (await this.getProductCapacity(productId, coverPeriod, coverAssetEnum)) ?? '';

      const result: GetQuoteResponse = {
        displayInfo: {
          premiumInAsset: maxPremiumInAsset.toString(),
          coverAmount,
          yearlyCostPerc: Number(yearlyCostPerc) / TARGET_PRICE_DENOMINATOR,
          maxCapacity,
        },
        buyCoverInput: {
          buyCoverParams: {
            coverId: CoverId.BUY,
            owner: coverBuyerAddress,
            productId,
            coverAsset: coverAssetEnum,
            amount: coverAmount,
            period: coverPeriod * 60 * 60 * 24, // seconds
            maxPremiumInAsset: maxPremiumInAsset.toString(),
            paymentAsset: coverAssetEnum,
            commissionRatio: DEFAULT_COMMISSION_RATIO,
            commissionDestination: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
            ipfsData,
          },
          poolAllocationRequests: quote.poolAllocationRequests,
        },
      };

      return { result, error: undefined };
    } catch (error: unknown) {
      return this.handleQuoteError(error, productId, coverPeriod, coverAssetEnum);
    }
  }

  /**
   * Calls the CoverRouter quote endpoint to retrieve the quote for the specified cover
   * @param productId Product ID
   * @param coverAmount Cover amount
   * @param coverPeriod Cover period in days
   * @param coverAsset Cover asset
   * @returns Quote response
   */
  private async getQuote(
    productId: number,
    coverAmount: string,
    coverPeriod: number,
    coverAsset: CoverAsset,
  ): Promise<CoverRouterQuoteResponse> {
    const params = { productId, amount: coverAmount, period: coverPeriod, coverAsset };
    const options: AxiosRequestConfig = {
      method: 'GET',
      params,
    };

    const response = await this.sendRequest<CoverRouterQuoteResponse>('/quote', options);
    if (!response) {
      throw new Error('Failed to fetch cover quote');
    }
    return response;
  }

  /**
   * Calls the CoverRouter capacity endpoint to retrieve the max capacity in the coverAsset for the specified cover
   * @param productId Product ID
   * @param coverPeriod Cover period in days
   * @param coverAsset Cover asset
   * @returns Maximum capacity
   */
  private async getProductCapacity(
    productId: number,
    coverPeriod: number,
    coverAsset: CoverAsset,
  ): Promise<string | undefined> {
    const params = { period: coverPeriod };
    const options: AxiosRequestConfig = {
      method: 'GET',
      params,
    };

    const response = await this.sendRequest<CoverRouterProductCapacityResponse>(`/capacity/${productId}`, options);

    if (!response) {
      throw new Error('Failed to fetch cover capacities');
    }

    return response.availableCapacity.find(av => av.assetId === coverAsset)?.amount;
  }

  /**
   * Handle errors when getting quotes
   * @param error Error object
   * @param productId Product ID
   * @param coverPeriod Cover period in days
   * @param coverAsset Cover asset
   * @returns Error response
   */
  private async handleQuoteError(
    error: unknown,
    productId: number,
    coverPeriod: number,
    coverAsset: CoverAsset,
  ): Promise<ErrorApiResponse> {
    const axiosError = error as AxiosError<{ error: string }>;
    if (axiosError.isAxiosError) {
      if (axiosError.response?.data?.error?.includes('Not enough capacity')) {
        try {
          // Get product capacity using helper method
          const maxCapacity = await this.getProductCapacity(productId, coverPeriod, coverAsset);

          return {
            result: undefined,
            error: {
              message: axiosError.response?.data.error,
              data: maxCapacity ? { maxCapacity } : undefined,
            },
          };
        } catch (capacityError) {
          // If we can't get capacity, just return the original error
          return {
            result: undefined,
            error: { message: axiosError.response?.data.error || 'Not enough capacity' },
          };
        }
      }
    }

    return {
      result: undefined,
      error: { message: (error as Error).message || 'Something went wrong' },
    };
  }
}
