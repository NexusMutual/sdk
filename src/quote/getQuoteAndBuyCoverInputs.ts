import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';

import { calculatePremiumWithCommissionAndSlippage } from '../buyCover/calculatePremiumWithCommissionAndSlippage';
import {
  CoverAsset,
  CoverId,
  DEFAULT_COMMISSION_RATIO,
  DEFAULT_SLIPPAGE,
  MINIMUM_COVER_PERIOD,
  NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
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

async function getQuoteAndBuyCoverInputs(
  productId: Integer,
  coverAmount: IntString,
  coverPeriod: Integer,
  coverAsset: CoverAsset,
  coverBuyerAddress: Address,
  paymentAsset: CoverAsset = coverAsset,
  slippage: number = DEFAULT_SLIPPAGE, // 0.1%
  ipfsData: string = '', // IPFS base32 hash value
): Promise<GetQuoteApiResponse | ErrorApiResponse> {
  let result: GetQuoteResponse | undefined = undefined;

  if (!process.env.COVER_ROUTER_URL) {
    return { result, error: { message: 'Missing COVER_ROUTER_URL env var', data: {} } };
  }

  if (!Number.isInteger(productId) || productId <= 0) {
    return { result, error: { message: 'Invalid productId: must be a positive integer', data: {} } };
  }

  if (!/^\d+$/.test(coverAmount) || parseInt(coverAmount, 10) <= 0) {
    return { result, error: { message: 'Invalid coverAmount: must be a positive integer string', data: {} } };
  }

  if (!Number.isInteger(coverPeriod) || coverPeriod < MINIMUM_COVER_PERIOD) {
    return {
      result,
      error: { message: `Invalid coverPeriod: must be at least ${MINIMUM_COVER_PERIOD} days`, data: {} },
    };
  }

  if (!Object.values(CoverAsset).includes(coverAsset)) {
    return { result, error: { message: 'Invalid coverAsset', data: {} } };
  }

  if (!Object.values(CoverAsset).includes(paymentAsset)) {
    return { result, error: { message: 'Invalid paymentAsset', data: {} } };
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(coverBuyerAddress)) {
    return { result, error: { message: 'Invalid coverBuyerAddress: must be a valid Ethereum address', data: {} } };
  }

  if (typeof slippage !== 'number' || slippage < 0 || slippage > 1) {
    return { result, error: { message: 'Invalid slippage: must be a number between 0 and 1', data: {} } };
  }

  if (ipfsData !== '' && !/^[A-Za-z2-7]{46}$/.test(ipfsData)) {
    return { result, error: { message: 'Invalid ipfsData: must be a valid IPFS base32 hash value', data: {} } };
  }

  try {
    const { quote, capacities } = await getQuote(productId, coverAmount, coverPeriod, coverAsset);

    const maxPremiumInAsset = calculatePremiumWithCommissionAndSlippage(
      BigInt(quote.premiumInAsset),
      DEFAULT_COMMISSION_RATIO,
      slippage,
    );

    result = {
      displayInfo: {
        premiumInAsset: quote.premiumInAsset,
        coverAmount,
        yearlyCostPerc: (BigInt(quote.annualPrice) / BigInt(TARGET_PRICE_DENOMINATOR)).toString(),
        maxCapacity: getMaxCapacity(capacities),
      },
      buyCoverInput: {
        buyCoverParams: {
          coverId: CoverId.BUY,
          owner: coverBuyerAddress,
          productId,
          coverAsset,
          amount: coverAmount,
          period: coverPeriod,
          maxPremiumInAsset: maxPremiumInAsset.toString(),
          paymentAsset,
          commissionRatio: DEFAULT_COMMISSION_RATIO,
          commissionDestination: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
          ipfsData,
        },
        poolAllocationRequests: quote.poolAllocationRequests,
      },
    };
    return { result, error: undefined };
  } catch (error: unknown) {
    return handleError(error);
  }
}

async function handleError(error: unknown): Promise<ErrorApiResponse> {
  const axiosError = error as AxiosError<{ error: string }>;
  if (axiosError.isAxiosError) {
    if (axiosError.response?.data.error.includes('Not enough capacity')) {
      return {
        result: undefined,
        error: {
          message: axiosError.response?.data.error,
          data: {}, // TODO: call /capacities and return max capacity data
        },
      };
    }
  }
  throw error;
}

function getMaxCapacity(capacities: PoolCapacity[]): IntString {
  let totalAmount: bigint = BigInt(0);

  capacities.forEach(poolCapacity => {
    poolCapacity.capacity.forEach(capacity => (totalAmount += BigInt(capacity.amount)));
  });

  return totalAmount.toString();
}

async function getQuote(
  productId: Integer,
  coverAmount: IntString,
  coverPeriod: Integer,
  coverAsset: CoverAsset,
): Promise<CoverRouterQuoteResponse> {
  const params: CoverRouterQuoteParams = { productId, amount: coverAmount, period: coverPeriod, coverAsset };
  const response: CoverRouterQuoteResponse = await axios.get(`${process.env.COVER_ROUTER_URL}/quote`, { params });
  // TODO: validate response
  return response;
}

export { getMaxCapacity, getQuoteAndBuyCoverInputs };
