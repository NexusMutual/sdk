export enum ContentType {
  coverValidators = 'coverValidators',
  coverQuotaShare = 'coverQuotaShare',
  coverAumCoverAmountPercentage = 'coverAumCoverAmountPercentage',
  coverWalletAddress = 'coverWalletAddress',
  coverWalletAddresses = 'coverWalletAddresses',
  coverFreeText = 'coverFreeText',
  // ---------------------------------------------------------
  stakingPoolDetails = 'stakingPoolDetails',
  claimProof = 'claimProof',
  assessmentCriteriaAnswers = 'assessmentCriteriaAnswers',
  governanceProposal = 'governanceProposal',
  governanceCategory = 'governanceCategory',
}

type CoverValidators = {
  version: '1.0';
  validators: string[];
};

type CoverQuotaShare = {
  version: '1.0';
  quotaShare: number;
};

type CoverAumCoverAmountPercentage = {
  version: '1.0';
  aumCoverAmountPercentage: number;
};

type CoverWalletAddress = {
  version: '1.0';
  walletAddress: string;
};

type CoverWalletAddresses =
  | {
      version: '1.0';
      walletAddresses: string;
    }
  | {
      version: '2.0';
      walletAddresses: string[];
    };

type CoverFreeText = {
  version: '1.0';
  freeText: string;
};

type StakingPoolDetails = {
  version: '1.0';
  poolName: string;
  poolDescription: string;
};

type ClaimProof = {
  version: '1.0';
  coverId: number;
  affectedAddresses: string[];
  affectedChain: string;
  incidentDescription: string;
  incidentTransactionHashes: string[];
  incidentEvidenceLinks: string[];
  attachedFilesHashes: string[];
};

type AssessmentCriteriaAnswers = {
  version: '1.0';
  answers: Record<string, string>;
};

type GovernanceProposal = {
  version: '1.0';
  proposal: string;
};

type GovernanceCategory = {
  version: '1.0';
  category: string;
};

export type IPFSContentTypes =
  | CoverValidators
  | CoverQuotaShare
  | CoverAumCoverAmountPercentage
  | CoverWalletAddress
  | CoverWalletAddresses
  | CoverFreeText
  // ---------------------------------------------------------
  | StakingPoolDetails
  | ClaimProof
  | AssessmentCriteriaAnswers
  | GovernanceProposal
  | GovernanceCategory;

export type IPFSContentAndType =
  | [type: ContentType.coverValidators, content: CoverValidators]
  | [type: ContentType.coverQuotaShare, content: CoverQuotaShare]
  | [type: ContentType.coverAumCoverAmountPercentage, content: CoverAumCoverAmountPercentage]
  | [type: ContentType.coverWalletAddress, content: CoverWalletAddress]
  | [type: ContentType.coverWalletAddresses, content: CoverWalletAddresses]
  | [type: ContentType.coverFreeText, content: CoverFreeText]
  // ---------------------------------------------------------
  | [type: ContentType.stakingPoolDetails, content: StakingPoolDetails]
  | [type: ContentType.claimProof, content: ClaimProof]
  | [type: ContentType.assessmentCriteriaAnswers, content: AssessmentCriteriaAnswers]
  | [type: ContentType.governanceProposal, content: GovernanceProposal]
  | [type: ContentType.governanceCategory, content: GovernanceCategory];
