import { z } from 'zod';

import {
  stakingPoolDetailsSchema,
  claimProofSchema,
  assessmentCriteriaAnswersSchema,
  governanceProposalSchema,
  governanceCategorySchema,
  fileSchema,
  assessmentReasonSchema,
  productAnnexSchema,
  coverMetadataRefSchema,
} from '../ipfs/schemas';

export enum ContentType {
  stakingPoolDetails = 'stakingPoolDetails',
  claimProof = 'claimProof',
  assessmentCriteriaAnswers = 'assessmentCriteriaAnswers',
  assessmentReason = 'assessmentReason',
  governanceProposal = 'governanceProposal',
  governanceCategory = 'governanceCategory',
  file = 'file',
  productAnnex = 'productAnnex',
  coverMetadataRef = 'coverMetadataRef',
}

export type StakingPoolDetails = z.infer<typeof stakingPoolDetailsSchema>;
export type ClaimProof = z.infer<typeof claimProofSchema>;
export type AssessmentCriteriaAnswers = z.infer<typeof assessmentCriteriaAnswersSchema>;
export type GovernanceProposal = z.infer<typeof governanceProposalSchema>;
export type GovernanceCategory = z.infer<typeof governanceCategorySchema>;
export type File = z.infer<typeof fileSchema>;
export type AssessmentReason = z.infer<typeof assessmentReasonSchema>;
export type ProductAnnex = z.infer<typeof productAnnexSchema>;
export type CoverMetadataRef = z.infer<typeof coverMetadataRefSchema>;

export type IPFSContentTypes =
  | StakingPoolDetails
  | ClaimProof
  | AssessmentCriteriaAnswers
  | AssessmentReason
  | GovernanceProposal
  | GovernanceCategory
  | File
  | ProductAnnex
  | CoverMetadataRef;

export type IPFSTypeContentTuple =
  | [type: ContentType.stakingPoolDetails, content: StakingPoolDetails]
  | [type: ContentType.claimProof, content: ClaimProof]
  | [type: ContentType.assessmentCriteriaAnswers, content: AssessmentCriteriaAnswers]
  | [type: ContentType.assessmentReason, content: AssessmentReason]
  | [type: ContentType.governanceProposal, content: GovernanceProposal]
  | [type: ContentType.governanceCategory, content: GovernanceCategory]
  | [type: ContentType.file, content: File]
  | [type: ContentType.productAnnex, content: ProductAnnex]
  | [type: ContentType.coverMetadataRef, content: CoverMetadataRef];

export type IPFSUploadServiceResponse = {
  ipfsHash: string;
};
