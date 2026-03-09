import { z } from 'zod';

import {
  coverValidatorsSchema,
  coverQuotaShareSchema,
  coverAumCoverAmountPercentageSchema,
  coverWalletAddressSchema,
  coverWalletAddressesSchema,
  coverFreeTextSchema,
  coverDesignatedWalletsSchema,
  defiPassContentSchema,
  stakingPoolDetailsSchema,
  claimProofSchema,
  assessmentCriteriaAnswersSchema,
  governanceProposalSchema,
  governanceCategorySchema,
  fileSchema,
  assessmentReasonSchema,
  productAnnexSchema,
} from '../ipfs/schemas';

export enum ContentType {
  coverValidators = 'coverValidators',
  coverQuotaShare = 'coverQuotaShare',
  coverAumCoverAmountPercentage = 'coverAumCoverAmountPercentage',
  coverWalletAddress = 'coverWalletAddress',
  coverWalletAddresses = 'coverWalletAddresses',
  coverFreeText = 'coverFreeText',
  coverDesignatedWallets = 'coverDesignatedWallets',
  defiPassContent = 'defiPassContent',
  // ---------------------------------------------------------
  stakingPoolDetails = 'stakingPoolDetails',
  claimProof = 'claimProof',
  assessmentCriteriaAnswers = 'assessmentCriteriaAnswers',
  assessmentReason = 'assessmentReason',
  governanceProposal = 'governanceProposal',
  governanceCategory = 'governanceCategory',
  file = 'file',
  productAnnex = 'productAnnex',
}

export type CoverValidators = z.infer<typeof coverValidatorsSchema>;
export type CoverQuotaShare = z.infer<typeof coverQuotaShareSchema>;
export type CoverAumCoverAmountPercentage = z.infer<typeof coverAumCoverAmountPercentageSchema>;
export type CoverWalletAddress = z.infer<typeof coverWalletAddressSchema>;
export type CoverWalletAddresses = z.infer<typeof coverWalletAddressesSchema>;
export type CoverFreeText = z.infer<typeof coverFreeTextSchema>;
export type CoverDesignatedWallets = z.infer<typeof coverDesignatedWalletsSchema>;
export type DefiPassContent = z.infer<typeof defiPassContentSchema>;
export type StakingPoolDetails = z.infer<typeof stakingPoolDetailsSchema>;
export type ClaimProof = z.infer<typeof claimProofSchema>;
export type AssessmentCriteriaAnswers = z.infer<typeof assessmentCriteriaAnswersSchema>;
export type GovernanceProposal = z.infer<typeof governanceProposalSchema>;
export type GovernanceCategory = z.infer<typeof governanceCategorySchema>;
export type File = z.infer<typeof fileSchema>;
export type AssessmentReason = z.infer<typeof assessmentReasonSchema>;
export type ProductAnnex = z.infer<typeof productAnnexSchema>;

export type IPFSContentTypes =
  | CoverValidators
  | CoverQuotaShare
  | CoverAumCoverAmountPercentage
  | CoverWalletAddress
  | CoverWalletAddresses
  | CoverFreeText
  | CoverDesignatedWallets
  | DefiPassContent
  // ---------------------------------------------------------
  | StakingPoolDetails
  | ClaimProof
  | AssessmentCriteriaAnswers
  | AssessmentReason
  | GovernanceProposal
  | GovernanceCategory
  | File
  | ProductAnnex;

export type IPFSTypeContentTuple =
  | [type: ContentType.coverValidators, content: CoverValidators]
  | [type: ContentType.coverQuotaShare, content: CoverQuotaShare]
  | [type: ContentType.coverAumCoverAmountPercentage, content: CoverAumCoverAmountPercentage]
  | [type: ContentType.coverWalletAddress, content: CoverWalletAddress]
  | [type: ContentType.coverWalletAddresses, content: CoverWalletAddresses]
  | [type: ContentType.coverFreeText, content: CoverFreeText]
  | [type: ContentType.coverDesignatedWallets, content: CoverDesignatedWallets]
  | [type: ContentType.defiPassContent, content: DefiPassContent]
  // ---------------------------------------------------------
  | [type: ContentType.stakingPoolDetails, content: StakingPoolDetails]
  | [type: ContentType.claimProof, content: ClaimProof]
  | [type: ContentType.assessmentCriteriaAnswers, content: AssessmentCriteriaAnswers]
  | [type: ContentType.assessmentReason, content: AssessmentReason]
  | [type: ContentType.governanceProposal, content: GovernanceProposal]
  | [type: ContentType.governanceCategory, content: GovernanceCategory]
  | [type: ContentType.file, content: File]
  | [type: ContentType.productAnnex, content: ProductAnnex];

export type IPFSUploadServiceResponse = {
  ipfsHash: string;
};
