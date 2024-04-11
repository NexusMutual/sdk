import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';

import { calculatePremiumWithCommissionAndSlippage } from '../buyCover/calculatePremiumWithCommissionAndSlippage';
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
} from '../constants/buyCover';
import {
  Address,
  CoverRouterProductCapacityResponse,
  CoverRouterQuoteResponse,
  ErrorApiResponse,
  GetQuoteApiResponse,
  GetQuoteResponse,
  IntString,
  Integer,
  PoolCapacity,
} from '../types';

dotenv.config();

type CoverRouterQuoteParams = {
  productId: Integer;
  amount: IntString;
  period: Integer;
  coverAsset: CoverAsset;
};

type CoverRouterCapacityParams = {
  period: Integer;
};

/**
 * Retrieves a quote for buying cover and prepares the necessary inputs for CoverBroker.buyCover method
 * The cover must be purchased using the same asset as the cover
 *
 * @param {Integer} productId - The ID of the product for which cover is being purchased.
 * @param {IntString} coverAmount - The amount of cover in smallest unit of currency (i.e. wei)
 * @param {Integer} coverPeriod - The duration of the cover in days (28-365).
 * @param {CoverAsset} coverAsset - The asset for which cover is being purchased (the cover must be purchased using the same asset)
 * @param {Address} coverBuyerAddress - The Ethereum address of the buyer.
 * @param {number} slippage - The acceptable slippage percentage. Must be between 0-1 (Defaults to 0.001 ~ 0.1%)
 * @param {string} ipfsCid - The IPFS CID for additional data (optional).
 * @return {Promise<GetQuoteApiResponse | ErrorApiResponse>} Returns a successful quote response or an error response.
 */
async function getQuoteAndBuyCoverInputs(
  productId: Integer,
  coverAmount: IntString,
  coverPeriod: Integer,
  coverAsset: CoverAsset,
  coverBuyerAddress: Address,
  slippage: number = DEFAULT_SLIPPAGE / SLIPPAGE_DENOMINATOR,
  ipfsCid: string = '',
): Promise<GetQuoteApiResponse | ErrorApiResponse> {
  if (!process.env.COVER_ROUTER_URL) {
    return { result: undefined, error: { message: 'Missing COVER_ROUTER_URL env var' } };
  }

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
      error: {
        message: `Invalid coverAsset: must be one of ${coverAssetsString}`,
      },
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

  if (typeof ipfsCid !== 'string') {
    return { result: undefined, error: { message: 'Invalid ipfsCid: must be a valid IPFS CID' } };
  }

  // convert slippage from 0-1 to 0-100_00
  slippage = slippage * SLIPPAGE_DENOMINATOR;

  try {
    const { quote, capacities } = await getQuote(productId, coverAmount, coverPeriod, coverAsset);

    const maxPremiumInAsset = calculatePremiumWithCommissionAndSlippage(
      BigInt(quote.premiumInAsset),
      DEFAULT_COMMISSION_RATIO,
      slippage,
    );
    const yearlyCostPerc = calculatePremiumWithCommissionAndSlippage(
      BigInt(quote.annualPrice),
      DEFAULT_COMMISSION_RATIO,
      slippage,
    );

    const result: GetQuoteResponse = {
      displayInfo: {
        premiumInAsset: maxPremiumInAsset.toString(),
        coverAmount,
        yearlyCostPerc: Number(yearlyCostPerc) / TARGET_PRICE_DENOMINATOR,
        maxCapacity: sumPoolCapacities(capacities),
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
          commissionRatio: DEFAULT_COMMISSION_RATIO,
          commissionDestination: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
          ipfsData: ipfsCid,
        },
        poolAllocationRequests: quote.poolAllocationRequests,
      },
    };

    return { result, error: undefined };
  } catch (error: unknown) {
    const errorResponse = await handleError(error, productId, coverPeriod, coverAsset);
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
): Promise<CoverRouterQuoteResponse> {
  const params: CoverRouterQuoteParams = { productId, amount: coverAmount, period: coverPeriod, coverAsset };
  const response = await axios.get<CoverRouterQuoteResponse>(process.env.COVER_ROUTER_URL + '/quote', { params });
  if (!response.data) {
    throw new Error('Failed to fetch cover quote');
  }
  return response.data;
}

/**
 * Calls the CoverRouter capacity endpoint to retrieve capacities for the specified cover
 */
async function getProductCapacity(
  productId: Integer,
  coverPeriod: Integer,
  coverAsset: CoverAsset,
): Promise<IntString | undefined> {
  const params: CoverRouterCapacityParams = { period: coverPeriod };
  const capacityUrl = process.env.COVER_ROUTER_URL + `/capacity/${productId}`;
  const response = await axios.get<CoverRouterProductCapacityResponse>(capacityUrl, { params });
  if (!response.data) {
    throw new Error('Failed to fetch cover capacities');
  }
  return response.data.availableCapacity.find(av => av.assetId === coverAsset)?.amount;
}

/**
 * Calculates the max capacity by summing up all the amounts in the given array of pool capacities.
 */
function sumPoolCapacities(capacities: PoolCapacity[]): IntString {
  let totalAmount: bigint = BigInt(0);

  capacities.forEach(poolCapacity => {
    poolCapacity.capacity.forEach(capacity => (totalAmount += BigInt(capacity.amount)));
  });

  return totalAmount.toString();
}

async function handleError(
  error: unknown,
  productId: Integer,
  coverPeriod: Integer,
  coverAsset: CoverAsset,
): Promise<ErrorApiResponse> {
  const axiosError = error as AxiosError<{ error: string }>;
  if (axiosError.isAxiosError) {
    console.log('axiosError.response.data: ', require('util').inspect(axiosError.response?.data, { depth: null }));

    if (axiosError.response?.data?.error?.includes('Not enough capacity')) {
      const maxCapacity = await getProductCapacity(productId, coverPeriod, coverAsset);
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

export { sumPoolCapacities, getQuoteAndBuyCoverInputs };
