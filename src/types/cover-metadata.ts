export type ProofOfLossType = 'address' | 'api_key' | 'validator' | 'csv';

export interface ProofOfLossValue {
  value: string;
  amount?: string;
  currency?: string;
}

export interface ProofOfLossEntry {
  type: ProofOfLossType;
  content: ProofOfLossValue[];
}

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
