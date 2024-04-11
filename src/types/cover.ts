import { CoverAsset } from '../constants/buyCover';
import { ApiResponse } from './api';
import { Address, IntString, Integer } from './data';

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
  ipfsData: string;
};

export type PoolAllocationRequest = {
  poolId: IntString;
  coverAmountInAsset: IntString; // smallest unit (i.e. wei)
  skip: boolean;
};

/* Cover Router Service */

export type CoverRouterQuoteResponse = {
  quote: Quote;
  capacities: PoolCapacity[];
};

export type Quote = {
  totalCoverAmountInAsset: IntString; // smallest unit (i.e. wei)
  annualPrice: IntString; // percentage expressed as number between 0 and 100_00
  premiumInNXM: IntString; // smallest unit (i.e. wei)
  premiumInAsset: IntString; // smallest unit (i.e. wei)
  poolAllocationRequests: PoolAllocationRequest[];
};

export type Capacity = { assetId: IntString; amount: IntString };

export type PoolCapacity = {
  poolId: IntString;
  capacity: Capacity[];
};

/* getQuoteAndBuyCoverInputs */

export type QuoteDisplayInfo = {
  premiumInAsset: IntString; // smallest unit (i.e. wei)
  coverAmount: IntString; // smallest unit (i.e. wei)
  yearlyCostPerc: number; // percentage expressed as number between 0 and 1
  maxCapacity: IntString; // smallest unit (i.e. wei)
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
