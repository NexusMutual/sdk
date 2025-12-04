import { z } from 'zod';

import { ProductTypes } from '../../generated/types';
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

export const IPFS_CONTENT_TYPE_BY_PRODUCT_TYPE: Record<ProductTypes, ContentType | undefined> = {
  [ProductTypes.ethSlashing]: ContentType.coverValidators,
  [ProductTypes.liquidCollectiveEthStaking]: ContentType.coverValidators,
  [ProductTypes.stakewiseEthStaking]: ContentType.coverValidators,
  [ProductTypes.sherlockQuotaShare]: ContentType.coverQuotaShare,
  [ProductTypes.unoReQuotaShare]: ContentType.coverQuotaShare,
  [ProductTypes.deFiPass]: ContentType.defiPassContent,
  [ProductTypes.nexusMutual]: ContentType.coverWalletAddresses,
  [ProductTypes.followOn]: ContentType.coverFreeText,
  [ProductTypes.fundPortfolio]: ContentType.coverAumCoverAmountPercentage,
  [ProductTypes.generalizedFundPortfolio]: ContentType.coverAumCoverAmountPercentage,
  // ---------------------------------------------------------
  [ProductTypes.singleProtocol]: undefined,
  [ProductTypes.custody]: undefined,
  [ProductTypes.yieldToken]: undefined,
  [ProductTypes.sherlockExcess]: undefined,
  [ProductTypes.nativeProtocol]: undefined,
  [ProductTypes.theRetailMutual]: undefined,
  [ProductTypes.multiProtocol]: undefined,
  [ProductTypes.ethSlashingUmbrella]: undefined,
  [ProductTypes.openCoverTransaction]: undefined,
  [ProductTypes.sherlockBugBounty]: undefined,
  [ProductTypes.immunefiBugBounty]: undefined,
  [ProductTypes.crypto]: undefined,
  [ProductTypes.nativeSyndicate]: undefined,
  [ProductTypes.spearbitCantina]: undefined,
  [ProductTypes.leveragedLiquidation]: undefined,
  [ProductTypes.nonEVMProtocol]: undefined,
  [ProductTypes.kidnapAndRansom]: undefined,
};

export interface IPFSContentForProductType {
  [ProductTypes.ethSlashing]: CoverValidators;
  [ProductTypes.liquidCollectiveEthStaking]: CoverValidators;
  [ProductTypes.stakewiseEthStaking]: CoverValidators;
  [ProductTypes.sherlockQuotaShare]: CoverQuotaShare;
  [ProductTypes.unoReQuotaShare]: CoverQuotaShare;
  [ProductTypes.deFiPass]: DefiPassContent;
  [ProductTypes.nexusMutual]: CoverWalletAddresses;
  [ProductTypes.followOn]: CoverFreeText;
  [ProductTypes.fundPortfolio]: CoverAumCoverAmountPercentage;
  [ProductTypes.generalizedFundPortfolio]: CoverAumCoverAmountPercentage;
  // ---------------------------------------------------------
  [ProductTypes.singleProtocol]: undefined;
  [ProductTypes.custody]: undefined;
  [ProductTypes.yieldToken]: undefined;
  [ProductTypes.sherlockExcess]: undefined;
  [ProductTypes.nativeProtocol]: undefined;
  [ProductTypes.theRetailMutual]: undefined;
  [ProductTypes.multiProtocol]: undefined;
  [ProductTypes.ethSlashingUmbrella]: undefined;
  [ProductTypes.openCoverTransaction]: undefined;
  [ProductTypes.sherlockBugBounty]: undefined;
  [ProductTypes.immunefiBugBounty]: undefined;
  [ProductTypes.crypto]: undefined;
  [ProductTypes.nativeSyndicate]: undefined;
  [ProductTypes.spearbitCantina]: undefined;
  [ProductTypes.leveragedLiquidation]: undefined;
  [ProductTypes.nonEVMProtocol]: undefined;
  [ProductTypes.kidnapAndRansom]: undefined;
}

export type IPFSUploadServiceResponse = {
  ipfsHash: string;
};
