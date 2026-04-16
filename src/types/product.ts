import { Integer } from './data';
import { ContentType } from './ipfs';
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
  ipfsContentType?: ContentType; // Optional field to specify required IPFS content type for the product
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
};
