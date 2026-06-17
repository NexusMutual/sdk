export interface AddressValue {
  address: string;
  label?: string;
}

export interface FreeTextValue {
  value: string;
  label?: string;
}

export interface ApiKeyValue {
  credential: string;
  label: string;
  role: string;
}

export interface ValidatorValue {
  value: string;
  label?: string;
  role?: string;
}

export interface CsvValue {
  address: string;
  amount: string;
  currency: string;
}

export type ProofOfLossEntry =
  | { type: 'address'; content: AddressValue[] }
  | { type: 'api_key'; content: ApiKeyValue[] }
  | { type: 'validator'; content: ValidatorValue[] }
  | { type: 'csv'; content: CsvValue[] }
  | { type: 'free_text'; content: FreeTextValue[] };

export interface CoverPublicData {
  quotaShare?: number;
  aumCoverAmountPercentage?: number;
}

export interface CoverMetadataInput {
  proofOfLoss?: ProofOfLossEntry[];
  publicData?: CoverPublicData;
}

export interface CoverMetadataResponse {
  cid: string;
}

/* Get Cover */

export interface GetCoverResponse {
  coverId: number;
  productId: number;
  coverAsset: number;
  amount: string;
  start: string;
  period: string;
  gracePeriod: string;
  coverMetadataId?: string;
}

export type GetCoverApiResponse = import('./api').ApiResponse<GetCoverResponse, undefined>;

/* Auth */

export interface AuthPayload {
  timestamp: bigint;
  message: string;
}

export interface AuthSignature {
  signature: string;
  payload: AuthPayload;
}

/* View Cover Metadata */

export interface ViewCoverMetadataParams {
  coverMetadataId: string;
  signature?: AuthSignature;
}

export interface PrivateMetadata {
  proofOfLoss: ProofOfLossEntry[] | null;
  createdAt: string | null;
}

export interface ViewCoverMetadataResponse {
  id: string;
  coverId: number;
  createdAt: string;
  updatedAt: string | null;
  publicData: CoverPublicData | null;
  privateData?: PrivateMetadata;
}

export type ViewCoverMetadataApiResponse = import('./api').ApiResponse<ViewCoverMetadataResponse, undefined>;

/* Edit Cover Metadata */

export interface EditCoverMetadataParams {
  coverMetadataId: string;
  proofOfLoss: ProofOfLossEntry[];
  signature: AuthSignature;
}

export type EditCoverMetadataApiResponse = import('./api').ApiResponse<{ success: boolean }, undefined>;
