import { ProductTypes } from '../../generated/types';

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

export type IPFSTypeContentTuple =
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

export const IPFS_CONTENT_TYPE_BY_PRODUCT_TYPE = {
  [ProductTypes.ethSlashing]: ContentType.coverValidators,
  [ProductTypes.liquidCollectiveEthStaking]: ContentType.coverValidators,
  [ProductTypes.stakewiseEthStaking]: ContentType.coverValidators,
  [ProductTypes.sherlockQuotaShare]: ContentType.coverQuotaShare,
  [ProductTypes.unoReQuotaShare]: ContentType.coverQuotaShare,
  [ProductTypes.deFiPass]: ContentType.coverWalletAddress,
  [ProductTypes.nexusMutual]: ContentType.coverWalletAddresses,
  [ProductTypes.followOn]: ContentType.coverFreeText,
  [ProductTypes.fundPortfolio]: ContentType.coverAumCoverAmountPercentage,
  [ProductTypes.generalisedFundPortfolio]: ContentType.coverAumCoverAmountPercentage,
  // ---------------------------------------------------------
  [ProductTypes.protocol]: undefined,
  [ProductTypes.custody]: undefined,
  [ProductTypes.yieldToken]: undefined,
  [ProductTypes.sherlockExcess]: undefined,
  [ProductTypes.nativeProtocol]: undefined,
  [ProductTypes.theRetailMutual]: undefined,
  [ProductTypes.bundledProtocol]: undefined,
  [ProductTypes.ethSlashingUmbrella]: undefined,
  [ProductTypes.openCoverTransaction]: undefined,
  [ProductTypes.sherlockBugBounty]: undefined,
  [ProductTypes.immunefiBugBounty]: undefined,
};

export interface IPFSContentForProductType {
  [ProductTypes.ethSlashing]: CoverValidators;
  [ProductTypes.liquidCollectiveEthStaking]: CoverValidators;
  [ProductTypes.stakewiseEthStaking]: CoverValidators;
  [ProductTypes.sherlockQuotaShare]: CoverQuotaShare;
  [ProductTypes.unoReQuotaShare]: CoverQuotaShare;
  [ProductTypes.deFiPass]: CoverWalletAddress;
  [ProductTypes.nexusMutual]: CoverWalletAddresses;
  [ProductTypes.followOn]: CoverFreeText;
  [ProductTypes.fundPortfolio]: CoverAumCoverAmountPercentage;
  [ProductTypes.generalisedFundPortfolio]: CoverAumCoverAmountPercentage;
  // ---------------------------------------------------------
  [ProductTypes.protocol]: undefined;
  [ProductTypes.custody]: undefined;
  [ProductTypes.yieldToken]: undefined;
  [ProductTypes.sherlockExcess]: undefined;
  [ProductTypes.nativeProtocol]: undefined;
  [ProductTypes.theRetailMutual]: undefined;
  [ProductTypes.bundledProtocol]: undefined;
  [ProductTypes.ethSlashingUmbrella]: undefined;
  [ProductTypes.openCoverTransaction]: undefined;
  [ProductTypes.sherlockBugBounty]: undefined;
  [ProductTypes.immunefiBugBounty]: undefined;
}

export type IPFSUploadServiceResponse = {
  ipfsHash: string;
};
