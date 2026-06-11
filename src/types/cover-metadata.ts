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
