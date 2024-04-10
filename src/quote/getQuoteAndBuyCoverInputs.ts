import axios, { AxiosError } from 'axios';
import { parseEther } from 'viem';
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

/**
 * Retrieves a quote for buying cover and prepares the necessary inputs for CoverBroker.buyCover method
 *
 * @param {Integer} productId - The ID of the product for which cover is being purchased.
 * @param {IntString} coverAmount - The amount of cover in smallest unit of currency (i.e. wei)
 * @param {Integer} coverPeriod - The duration of the cover in days (28-365).
 * @param {CoverAsset} coverAsset - The asset for which cover is being purchased.
 * @param {Address} coverBuyerAddress - The Ethereum address of the buyer.
 * @param {CoverAsset} paymentAsset - The asset used for payment (defaults to coverAsset).
 * @param {number} slippage - The acceptable slippage percentage (defaults to 0.1%)
 * @param {string} ipfsCid - The IPFS CID for additional data (optional).
 * @return {Promise<GetQuoteApiResponse | ErrorApiResponse>} Returns a successful quote response or an error response.
 */
async function getQuoteAndBuyCoverInputs(
  productId: Integer,
  coverAmount: IntString,
  coverPeriod: Integer,
  coverAsset: CoverAsset,
  coverBuyerAddress: Address,
  paymentAsset: CoverAsset = coverAsset,
  slippage: number = DEFAULT_SLIPPAGE,
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

  if (!Object.values(CoverAsset).includes(paymentAsset)) {
    return {
      result: undefined,
      error: {
        message: `Invalid paymentAsset: must be one of ${coverAssetsString}`,
      },
    };
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(coverBuyerAddress)) {
    return { result: undefined, error: { message: 'Invalid coverBuyerAddress: must be a valid Ethereum address' } };
  }

  if (typeof slippage !== 'number' || slippage < 0 || slippage > SLIPPAGE_DENOMINATOR) {
    return {
      result: undefined,
      error: { message: `Invalid slippage: must be a number between 0 and ${SLIPPAGE_DENOMINATOR}` },
    };
  }

  if (typeof ipfsCid !== 'string') {
    return { result: undefined, error: { message: 'Invalid ipfsCid: must be a valid IPFS CID' } };
  }

  try {
    const { quote, capacities } = await getQuote(productId, coverAmount, coverPeriod, coverAsset);

    const maxPremiumInAsset = calculatePremiumWithCommissionAndSlippage(
      BigInt(quote.premiumInAsset),
      DEFAULT_COMMISSION_RATIO,
      slippage,
    );
    const yearlyCostPerc = calculatePremiumWithCommissionAndSlippage(
      BigInt(parseEther(quote.annualPrice).toString()) / BigInt(TARGET_PRICE_DENOMINATOR),
      DEFAULT_COMMISSION_RATIO,
      slippage,
    );

    const result: GetQuoteResponse = {
      displayInfo: {
        premiumInAsset: maxPremiumInAsset.toString(),
        coverAmount,
        yearlyCostPerc: yearlyCostPerc.toString(),
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
          paymentAsset,
          commissionRatio: DEFAULT_COMMISSION_RATIO,
          commissionDestination: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
          ipfsData: ipfsCid,
        },
        poolAllocationRequests: quote.poolAllocationRequests,
      },
    };

    return { result, error: undefined };
  } catch (error: unknown) {
    return handleError(error);
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
  const url = new URL('/quote', process.env.COVER_ROUTER_URL);
  const params: CoverRouterQuoteParams = { productId, amount: coverAmount, period: coverPeriod, coverAsset };
  const response = await axios.get<CoverRouterQuoteResponse>(url.href, { params });
  return response.data;
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

async function handleError(error: unknown): Promise<ErrorApiResponse> {
  const axiosError = error as AxiosError<{ error: string }>;
  if (axiosError.isAxiosError) {
    if (axiosError.response?.data.error.includes('Not enough capacity')) {
      return {
        result: undefined,
        error: {
          message: axiosError.response?.data.error,
          data: {},
        },
      };
    }
  }
  throw error;
}

export { sumPoolCapacities, getQuoteAndBuyCoverInputs };
