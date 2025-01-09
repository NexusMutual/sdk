export enum ContentType {
  coverValidators = 'coverValidators',
  coverQuotaShare = 'coverQuotaShare',
  coverAumCoverAmountPercentage = 'coverAumCoverAmountPercentage',
  coverWalletAddresses = 'coverWalletAddresses',
  coverFreeText = 'coverFreeText',
  // ---------------------------------------------------------
  stakingPoolDetails = 'stakingPoolDetails',
  claimProof = 'claimProof',
  assessmentCriteriaAnswers = 'assessmentCriteriaAnswers',
  governanceProposal = 'governanceProposal',
  governanceCategory = 'governanceCategory',
}

export const DEFAULT_VERSION = '1.0';

export interface IPFSDataTypes {
  [ContentType.coverValidators]: { validators: string[] };
  [ContentType.coverQuotaShare]: { quotaShare: number };
  [ContentType.coverAumCoverAmountPercentage]: { aumCoverAmountPercentage: number };
  [ContentType.coverWalletAddresses]: { walletAddresses: string[] };
  [ContentType.coverFreeText]: { freeText: string };
  //   ---------------------------------------------------------
  [ContentType.stakingPoolDetails]: { poolName: string; poolDescription: string };
  [ContentType.claimProof]: {
    coverId: number;
    affectedAddresses: string[];
    affectedChain: string;
    incidentDescription: string;
    incidentTransactionHashes: string[];
    incidentEvidenceLinks: string[];
    attachedFilesHashes: string[];
  };
  [ContentType.assessmentCriteriaAnswers]: { answers: Record<string, string> };
  [ContentType.governanceProposal]: { proposal: string };
  [ContentType.governanceCategory]: { category: string };
}
