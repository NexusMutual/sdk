import { ProofOfLossEntry } from './cover-metadata';
import { Integer } from './data';
import { CoverAsset, ProductCategoryEnum } from '../constants';

export type ProductTypeFormInput = {
  label?: string;
  tooltip?: string;
};

export type RichTextContent = {
  type: string;
  content?: unknown[];
};

export type ProductTypeIpfsContentType =
  | 'coverAumCoverAmountPercentage'
  | 'coverFreeText'
  | 'coverQuotaShare'
  | 'coverValidators'
  | 'coverWalletAddresses'
  | 'defiPassContent';

export type BuyCoverFormType = 'basic' | 'withQuotaShare' | 'withAUM' | 'withFreeText' | 'trm' | 'unsupported';

export type ProductType = {
  id: Integer;
  name: string;
  metadata: string;
  claimMethod: string;
  gracePeriod: string;
  assessmentCooldownPeriod: string;
  payoutRedemptionPeriod: string;
  commissionRatio: string;
  commissionDestination: string;
  buyCoverForm?: BuyCoverFormType;
  isDeprecated?: boolean;
  termsAndConditions?: RichTextContent;
  amountInput?: ProductTypeFormInput;
  periodInput?: ProductTypeFormInput;
  freeTextInput?: ProductTypeFormInput;
  ipfsContentType?: ProductTypeIpfsContentType;
};

export type ProductMetadata = {
  annex?: string;
  schedule?: string;
  exclusions?: string;
  version?: string;
  error?: boolean;
  ipfsHash?: string;
};

export type ApiKeyServiceRole = {
  id: string;
  label: string;
};

export type ApiKeyService = {
  id: string;
  label: string;
  apiUrl: string;
  roles: ApiKeyServiceRole[];
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
  metadata: string | ProductMetadata;
  allowedPools: Integer[];
  timestamp: number;
  isPrivate: boolean;
  category?: ProductCategoryEnum;
  logo?: string;
  proofOfLossInputTypes?: ProofOfLossEntry['type'][];
  requiredApiKeyServices?: ApiKeyService[];
  aumPercentage?: string;
  minCoverAmount?: string;
  priorityPools?: Integer[];
  buyCoverDisclaimerTop?: RichTextContent;
};

export type ProductFilters = {
  name?: string;
  productType?: Integer[];
  category?: ProductCategoryEnum[];
  isPrivate?: boolean;
  isDeprecated?: boolean;
};

export type GetProductsOptions = {
  ids?: Integer[];
  filters?: ProductFilters;
};
