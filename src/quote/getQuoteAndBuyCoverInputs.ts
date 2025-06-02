import axios, { AxiosError } from 'axios';

import productTypes from '../../generated/product-types.json';
import products from '../../generated/products.json';
import { ProductTypes } from '../../generated/types';
import { calculatePremiumWithCommissionAndSlippage } from '../buyCover/calculatePremiumWithCommissionAndSlippage';
import {
  BUY_COVER_COMMISSION_DESTINATION_BY_PRODUCT_TYPE,
  BUY_COVER_COMMISSION_RATIO_BY_PRODUCT_TYPE,
  CoverAsset,
  CoverId,
  DEFAULT_SLIPPAGE,
  MAXIMUM_COVER_PERIOD,
  MINIMUM_COVER_PERIOD,
  PaymentAsset,
  SLIPPAGE_DENOMINATOR,
  TARGET_PRICE_DENOMINATOR,
} from '../constants/buyCover';
import { uploadIPFSContent, validateIPFSCid } from '../ipfs';
import {
  Address,
  CoverRouterProductCapacityResponse,
  CoverRouterQuoteResponse,
  ErrorApiResponse,
  GetQuoteApiResponse,
  GetQuoteResponse,
  IntString,
  Integer,
} from '../types';
import { IPFS_CONTENT_TYPE_BY_PRODUCT_TYPE, IPFSContentForProductType, IPFSTypeContentTuple } from '../types/ipfs';

type CoverRouterQuoteParams = {
  productId: Integer;
  amount: IntString;
  period: Integer;
  coverAsset: CoverAsset;
  paymentAsset: PaymentAsset;
};

type CoverRouterCapacityParams = {
  period: Integer;
};

type ProductDTO = Omit<(typeof products)[number], 'productType'> & {
  productType: ProductTypes;
};

export const productsMap: Record<number, ProductDTO> = products.reduce(
  (acc, product) => ({ ...acc, [product.id]: product }),
  {},
);

function getQuoteAndBuyCoverInputs(
  productId: Integer,
  coverAmount: IntString,
  coverPeriod: Integer,
  coverAsset: CoverAsset,
  coverBuyerAddress: Address,
  slippage?: number,
  ipfsCid?: string,
  nexusApiUrl?: string,
  commissionRatio?: number,
  commissionDestination?: Address,
  paymentAsset?: PaymentAsset,
): Promise<GetQuoteApiResponse | ErrorApiResponse>;

// overload with ipfsContent instead of Cid
function getQuoteAndBuyCoverInputs<ProductTypes extends keyof IPFSContentForProductType>(
  productId: Integer,
  coverAmount: IntString,
  coverPeriod: Integer,
  coverAsset: CoverAsset,
  coverBuyerAddress: Address,
  slippage?: number,
  ipfsContent?: IPFSContentForProductType[ProductTypes],
  nexusApiUrl?: string,
  commissionRatio?: number,
  commissionDestination?: Address,
  paymentAsset?: PaymentAsset,
): Promise<GetQuoteApiResponse | ErrorApiResponse>;

/**
 * Retrieves a quote for buying cover and prepares the necessary inputs for CoverBroker.buyCover method
 * The cover must be purchased using the same asset as the cover
 *
 * @param {Integer} productId - The ID of the product for which cover is being purchased.
 * @param {IntString} coverAmount - The amount of cover in smallest unit of currency (i.e. wei)
 * @param {Integer} coverPeriod - The duration of the cover in days (28-365).
 * @param {CoverAsset} coverAsset - The asset for which cover is being purchased; the purchase must use the same asset.
 * @param {Address} coverBuyerAddress - The Ethereum address of the buyer.
 * @param {number} slippage - The acceptable slippage percentage. Must be between 0-1 (Defaults to 0.001 ~ 0.1%)
 * @param {string} ipfsCidOrContent - The IPFS CID or content for additional data (optional).
 * @param {string} nexusApiUrl - Used to override the default Nexus Mutual API URL which is bundled this library.
 * @param {number} commissionRatio - The commission ratio for the cover purchase (optional).
 * @param {Address} commissionDestination - The address to which the commission is sent (optional).
 * @param {PaymentAsset} paymentAsset - The asset with which cover is being purchased.
 * @return {Promise<GetQuoteApiResponse | ErrorApiResponse>} Returns a successful quote response or an error response.
 */
async function getQuoteAndBuyCoverInputs(
  productId: Integer,
  coverAmount: IntString,
  coverPeriod: Integer,
  coverAsset: CoverAsset,
  coverBuyerAddress: Address,
  slippage: number = DEFAULT_SLIPPAGE / SLIPPAGE_DENOMINATOR,
  ipfsCidOrContent: string | IPFSContentForProductType[ProductTypes] = '',
  nexusApiUrl = 'https://api.nexusmutual.io/v2',
  commissionRatio?: number,
  commissionDestination?: Address,
  paymentAsset: PaymentAsset | CoverAsset = coverAsset,
): Promise<GetQuoteApiResponse | ErrorApiResponse> {
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

  if (!Object.values(CoverAsset).includes(coverAsset)) {
    return {
      result: undefined,
      error: { message: `Invalid coverAsset: must be one of ${coverAssetsString}` },
    };
  }

  if (paymentAsset !== PaymentAsset.NXM && paymentAsset !== coverAsset) {
    return {
      result: undefined,
      error: { message: `Invalid payment asset: must be one of ${coverAsset} or NXM` },
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

  if (typeof ipfsCidOrContent !== 'string' && !ipfsCidOrContent?.version) {
    return { result: undefined, error: { message: 'Invalid ipfsCid: must be a valid IPFS CID' } };
  }

  if (typeof ipfsCidOrContent === 'string' && ipfsCidOrContent !== '') {
    const isValidCID = validateIPFSCid(ipfsCidOrContent);
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

  if (typeof ipfsCidOrContent !== 'string' && contentType !== undefined && ipfsCidOrContent) {
    try {
      ipfsData = await uploadIPFSContent([contentType, ipfsCidOrContent] as IPFSTypeContentTuple, nexusApiUrl);
    } catch (error: unknown) {
      return {
        result: undefined,
        error: { message: (error as Error).message || 'Failed to upload IPFS content' },
      };
    }
  }

  // convert slippage from 0-1 to 0-100_00
  slippage = slippage * SLIPPAGE_DENOMINATOR;

  try {
    const { quote } = await getQuote(
      productId,
      coverAmount,
      coverPeriod,
      coverAsset,
      nexusApiUrl,
      paymentAsset as PaymentAsset,
    );

    const maxPremiumInAsset = calculatePremiumWithCommissionAndSlippage(
      BigInt(quote.premiumInAsset),
      commissionRatio || BUY_COVER_COMMISSION_RATIO_BY_PRODUCT_TYPE[productType],
      slippage,
    );
    const yearlyCostPerc = calculatePremiumWithCommissionAndSlippage(
      BigInt(quote.annualPrice),
      commissionRatio || BUY_COVER_COMMISSION_RATIO_BY_PRODUCT_TYPE[productType],
      slippage,
    );

    const result: GetQuoteResponse = {
      displayInfo: {
        premiumInAsset: maxPremiumInAsset.toString(),
        coverAmount,
        yearlyCostPerc: Number(yearlyCostPerc) / TARGET_PRICE_DENOMINATOR,
        maxCapacity: (await getProductCapacity(productId, coverPeriod, coverAsset, nexusApiUrl)) ?? '',
      },
      buyCoverInput: {
        buyCoverParams: {
          coverId: CoverId.BUY,
          owner: coverBuyerAddress,
          productId,
          coverAsset,
          amount: coverAmount,
          period: coverPeriod * 60 * 60 * 24, // seconds
          maxPremiumInAsset: maxPremiumInAsset.toString(),
          paymentAsset: coverAsset,
          commissionRatio: commissionRatio || BUY_COVER_COMMISSION_RATIO_BY_PRODUCT_TYPE[productType],
          commissionDestination: commissionDestination || BUY_COVER_COMMISSION_DESTINATION_BY_PRODUCT_TYPE[productType],
          ipfsData,
        },
        poolAllocationRequests: quote.poolAllocationRequests,
      },
    };

    return { result, error: undefined };
  } catch (error: unknown) {
    const errorResponse = await handleError(error, productId, coverPeriod, coverAsset, nexusApiUrl);
    return errorResponse;
  }
}

/**
 * Calls the CoverRouter quote endpoint to retrieve the quote for the specified cover
 */
async function getQuote(
  productId: Integer,
  coverAmount: IntString,
  coverPeriod: Integer,
  coverAsset: CoverAsset,
  nexusApiUrl: string,
  paymentAsset: PaymentAsset,
): Promise<CoverRouterQuoteResponse> {
  const params: CoverRouterQuoteParams = {
    productId,
    amount: coverAmount,
    period: coverPeriod,
    coverAsset,
    paymentAsset,
  };
  const response = await axios.get<CoverRouterQuoteResponse>(nexusApiUrl + '/quote', { params });
  if (!response.data) {
    throw new Error('Failed to fetch cover quote');
  }
  return response.data;
}

/**
 * Calls the CoverRouter capacity endpoint to retrieve the max capacity in the coverAsset for the specified cover
 */
async function getProductCapacity(
  productId: Integer,
  coverPeriod: Integer,
  coverAsset: CoverAsset,
  nexusApiUrl: string,
): Promise<IntString | undefined> {
  const params: CoverRouterCapacityParams = { period: coverPeriod };
  const capacityUrl = nexusApiUrl + `/capacity/${productId}`;
  const response = await axios.get<CoverRouterProductCapacityResponse>(capacityUrl, { params });
  if (!response.data) {
    throw new Error('Failed to fetch cover capacities');
  }
  return response.data.availableCapacity.find(av => av.assetId === coverAsset)?.amount;
}

async function handleError(
  error: unknown,
  productId: Integer,
  coverPeriod: Integer,
  coverAsset: CoverAsset,
  nexusApiUrl: string,
): Promise<ErrorApiResponse> {
  const axiosError = error as AxiosError<{ error: string }>;
  if (axiosError.isAxiosError) {
    if (axiosError.response?.data?.error?.includes('Not enough capacity')) {
      const maxCapacity = await getProductCapacity(productId, coverPeriod, coverAsset, nexusApiUrl);
      return {
        result: undefined,
        error: {
          message: axiosError.response?.data.error,
          data: maxCapacity ? { maxCapacity } : undefined,
        },
      };
    }
  }

  return {
    result: undefined,
    error: { message: (error as Error).message || 'Something went wrong' },
  };
}

export { getQuoteAndBuyCoverInputs };
