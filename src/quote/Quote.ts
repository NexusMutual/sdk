import {
  COMMISSION_DENOMINATOR,
  CoverAsset,
  DEFAULT_SLIPPAGE,
  MAXIMUM_COVER_PERIOD,
  MINIMUM_COVER_PERIOD,
  PaymentAsset,
  SLIPPAGE_DENOMINATOR,
  TARGET_PRICE_DENOMINATOR,
} from '../constants';
import { ApiError, NexusSDKBase, RequestConfig } from '../nexus-sdk-base';
import { ProductAPI } from '../product-api/ProductAPI';
import {
  CoverMetadataInput,
  CoverMetadataResponse,
  CoverRouterProductCapacityResponse,
  CoverRouterQuoteResponse,
  ErrorApiResponse,
  GetQuoteApiResponse,
  GetQuoteResponse,
  GetQuoteAndBuyCoverInputsParams,
  NexusSDKConfig,
  QuoteParams,
} from '../types';

/**
 * Class for handling quote-related functionality
 */
export class Quote extends NexusSDKBase {
  private productAPI: ProductAPI;

  /**
   * Create a new Quote instance
   * @param config SDK configuration
   */
  constructor(config: NexusSDKConfig = {}) {
    super(config);
    this.productAPI = new ProductAPI(config);
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
      amount,
      period,
      coverAsset,
      buyerAddress,
      slippage = DEFAULT_SLIPPAGE / SLIPPAGE_DENOMINATOR,
      coverMetadata,
      paymentAsset = coverAsset,
      coverId = 0,
      commissionRatio,
      commissionDestination,
    } = params;

    // Cast coverAsset to the proper enum type
    const coverAssetEnum = coverAsset as unknown as CoverAsset;

    if (!Number.isInteger(productId) || productId <= 0) {
      return { result: undefined, error: { message: 'Invalid productId: must be a positive integer' } };
    }

    if (typeof amount !== 'string' || !/^\d+$/.test(amount) || parseInt(amount, 10) <= 0) {
      return { result: undefined, error: { message: 'Invalid coverAmount: must be a positive integer string' } };
    }

    if (!Number.isInteger(period) || period < MINIMUM_COVER_PERIOD || period > MAXIMUM_COVER_PERIOD) {
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

    if (paymentAsset !== PaymentAsset.NXM && paymentAsset !== coverAsset) {
      return {
        result: undefined,
        error: { message: `Invalid payment asset: must be same as cover asset or NXM` },
      };
    }

    // Cast coverAsset to the proper enum type
    const paymentAssetEnum = paymentAsset as unknown as PaymentAsset;

    if (!/^0x[a-fA-F0-9]{40}$/.test(buyerAddress)) {
      return { result: undefined, error: { message: 'Invalid buyerAddress: must be a valid Ethereum address' } };
    }

    if (typeof slippage !== 'number' || slippage < 0 || slippage > 1) {
      return {
        result: undefined,
        error: { message: 'Invalid slippage: must be a number between 0 and 1' },
      };
    }

    let product: Awaited<ReturnType<ProductAPI['getProductById']>>;
    let productType: Awaited<ReturnType<ProductAPI['getProductTypeById']>>;
    try {
      product = await this.productAPI.getProductById(productId);
      const productTypeId = product?.productType;
      if (productTypeId === undefined) {
        return {
          result: undefined,
          error: { message: `Invalid product` },
        };
      }

      productType = await this.productAPI.getProductTypeById(productTypeId);
      if (!productType) {
        return {
          result: undefined,
          error: { message: 'Invalid product type' },
        };
      }
    } catch (error: unknown) {
      return {
        result: undefined,
        error: { message: (error as Error).message || 'Failed to fetch product data' },
      };
    }

    if (
      product.proofOfLossInputTypes?.length &&
      (!coverMetadata?.proofOfLoss || coverMetadata.proofOfLoss.length === 0)
    ) {
      return {
        result: undefined,
        error: {
          message: `Missing cover metadata. ${productType.name} requires proof of loss data.`,
        },
      };
    }

    // Check if the required proof of loss types are provided
    const requiredTypes = product.proofOfLossInputTypes;
    if (requiredTypes && requiredTypes.length > 0 && coverMetadata?.proofOfLoss) {
      const providedTypes = new Set(coverMetadata.proofOfLoss.map(e => e.type));
      if (!requiredTypes.every(t => providedTypes.has(t))) {
        return {
          result: undefined,
          error: { message: `Missing required proof of loss types. Required: ${requiredTypes.join(', ')}` },
        };
      }
    }

    let ipfsData = '';
    const hasCoverMetadata =
      coverMetadata?.proofOfLoss?.length ||
      (coverMetadata?.publicData && Object.keys(coverMetadata.publicData).length > 0);

    if (hasCoverMetadata) {
      try {
        ipfsData = await this.createCoverMetadata(coverMetadata);
      } catch (error: unknown) {
        return {
          result: undefined,
          error: { message: (error as Error).message || 'Failed to create cover metadata' },
        };
      }
    }

    // Convert slippage from 0-1 to 0-100_00
    const slippageValue = slippage * SLIPPAGE_DENOMINATOR;
    const quoteParams: QuoteParams = {
      productId,
      amount,
      period,
      coverAsset: coverAssetEnum,
      paymentAsset: paymentAssetEnum,
    };

    if (coverId) {
      quoteParams.coverEditId = coverId;
    }

    try {
      // Get quote using helper method
      const { quote } = await this.getQuote(quoteParams);

      const resolvedCommissionRatio = commissionRatio ?? Number(productType.commissionRatio);

      const premium = paymentAssetEnum === PaymentAsset.NXM ? quote.premiumInNXM : quote.premiumInAsset;

      const maxPremiumInAsset = this.calculatePremiumWithCommissionAndSlippage(
        BigInt(premium),
        resolvedCommissionRatio,
        slippageValue,
      );
      const yearlyCostPerc = this.calculatePremiumWithCommissionAndSlippage(
        BigInt(quote.annualPrice),
        resolvedCommissionRatio,
        slippageValue,
      );

      // Get product capacity using helper method
      const maxCapacity = (await this.getProductCapacity(productId, period, coverAssetEnum)) ?? '';

      const result: GetQuoteResponse = {
        displayInfo: {
          premiumInAsset: maxPremiumInAsset.toString(),
          coverAmount: amount,
          yearlyCostPerc: Number(yearlyCostPerc) / TARGET_PRICE_DENOMINATOR,
          maxCapacity,
        },
        buyCoverInput: {
          buyCoverParams: {
            coverId,
            owner: buyerAddress,
            productId,
            coverAsset: coverAssetEnum,
            amount,
            period: period * 60 * 60 * 24, // seconds
            maxPremiumInAsset: maxPremiumInAsset.toString(),
            paymentAsset: paymentAssetEnum,
            commissionRatio: resolvedCommissionRatio,
            commissionDestination: commissionDestination ?? productType.commissionDestination,
            ipfsData,
          },
          poolAllocationRequests: quote.poolAllocationRequests,
        },
      };

      return { result, error: undefined };
    } catch (error: unknown) {
      return this.handleQuoteError(error, productId, period, coverAssetEnum);
    }
  }

  /**
   * Creates cover metadata via the backend and returns the IPFS CID
   * @param input Cover metadata input
   * @returns IPFS CID string
   */
  private async createCoverMetadata(input: CoverMetadataInput): Promise<string> {
    const options: RequestConfig = {
      method: 'POST',
      data: input,
    };
    const response = await this.sendRequest<CoverMetadataResponse>('/cover-metadata', options);
    return response.cid;
  }

  /**
   * Calls the CoverRouter quote endpoint to retrieve the quote for the specified cover
   * @param params All params needed to buy a cover
   * @returns Quote response
   */
  private async getQuote(params: QuoteParams): Promise<CoverRouterQuoteResponse> {
    const options: RequestConfig = {
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
    const options: RequestConfig = {
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
    if (error instanceof ApiError) {
      const apiErrorMessage = (error.data as { error?: string })?.error;
      if (apiErrorMessage?.includes('Not enough capacity')) {
        try {
          const maxCapacity = await this.getProductCapacity(productId, coverPeriod, coverAsset);

          return {
            result: undefined,
            error: {
              message: apiErrorMessage,
              data: maxCapacity ? { maxCapacity } : undefined,
            },
          };
        } catch (capacityError) {
          return {
            result: undefined,
            error: { message: apiErrorMessage || 'Not enough capacity' },
          };
        }
      }
    }

    return {
      result: undefined,
      error: { message: (error as Error).message || 'Something went wrong' },
    };
  }

  /**
   * Calculate premium with commission and slippage
   * @param premium Base premium
   * @param commission Commission rate (default: 0)
   * @param slippage Slippage tolerance (default: 0)
   * @returns Premium with commission and slippage applied
   */
  public calculatePremiumWithCommissionAndSlippage(premium: bigint, commission = 0, slippage = 0): bigint {
    const premiumWithCommission =
      (premium * BigInt(COMMISSION_DENOMINATOR)) / BigInt(COMMISSION_DENOMINATOR - commission);

    const premiumWithCommissionAndSlippage =
      (premiumWithCommission * BigInt(SLIPPAGE_DENOMINATOR + slippage)) / BigInt(SLIPPAGE_DENOMINATOR);

    return premiumWithCommissionAndSlippage;
  }
}
