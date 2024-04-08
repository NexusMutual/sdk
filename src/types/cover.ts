import { CoverAsset } from '../constants/buyCover';
import { ApiResponse } from './api';
import { Address, Integer, IntString, DataHexString } from './data';

export type BuyCoverParams = {
  coverId: Integer;
  owner: Address;
  productId: Integer;
  coverAsset: CoverAsset;
  amount: IntString;
  period: Integer; // period in seconds
  maxPremiumInAsset: IntString;
  paymentAsset: Integer;
  commissionRatio: number;
  commissionDestination?: Address;
  ipfsData: DataHexString;
};

export type PoolAllocationRequest = {
  poolId: IntString;
  coverAmountInAsset: IntString;
  skip: boolean;
};

/* Cover Router Service */

export type CoverRouterQuoteResponse = {
  quote: Quote;
  capacities: PoolCapacity[];
};

export type Quote = {
  totalCoverAmountInAsset: IntString;
  annualPrice: IntString;
  premiumInNXM: IntString;
  premiumInAsset: IntString;
  poolAllocationRequests: PoolAllocationRequest[];
};

export type Capacity = { assetId: IntString; amount: IntString };

export type PoolCapacity = {
  poolId: IntString;
  capacity: Capacity[];
};

/* getQuoteAndBuyCoverInputs */

export type QuoteDisplayInfo = {
  premiumInAsset: IntString;
  coverAmount: IntString;
  yearlyCostPerc: IntString;
  maxCapacity: IntString;
};

export type BuyCoverInput = {
  buyCoverParams: BuyCoverParams;
  poolAllocationRequests: PoolAllocationRequest[];
};

export type GetQuoteResponse = {
  displayInfo: QuoteDisplayInfo;
  buyCoverInput: BuyCoverInput;
};

export type GetQuoteApiResponse = ApiResponse<GetQuoteResponse, undefined>;
