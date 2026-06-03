import { ProofOfLossType } from './cover-metadata';
import { Integer } from './data';
import { CoverAsset } from '../constants';

export type ProductType = {
  id: Integer;
  name: string;
  metadata: string;
  claimMethod: Integer;
  gracePeriod: string;
  assessmentCooldownPeriod: string;
  payoutRedemptionPeriod: string;
  commissionRatio: string;
  commissionDestination: string;
  isProofOfLossRequired?: boolean; // Optional field to specify if proof of loss is required for the product
};

export type Product = {
  id: Integer;
  productType: ProductType['id'];
  name: string;
  minPrice: string;
  coverAssets: Array<{ assetId: CoverAsset; assetSymbol: string }>;
  initialPriceRatio: string;
  capacityReductionRatio: string;
  isDeprecated: boolean;
  useFixedPrice: boolean;
  metadata: string | { annex?: string; schedule?: string; exclusions?: string };
  allowedPools: Integer[];
  timestamp: number;
  isPrivate: boolean;
  logo?: string;
  proofOfLossInputTypes?: ProofOfLossType[];
};
