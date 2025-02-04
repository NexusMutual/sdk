import {
  assessmentCriteriaAnswersSchema,
  claimProofSchema,
  coverAumCoverAmountPercentageSchema,
  coverDesignatedWalletsSchema,
  coverFreeTextSchema,
  coverQuotaShareSchema,
  coverValidatorsSchema,
  coverWalletAddressSchema,
  coverWalletAddressesSchema,
  defiPassContentSchema,
  governanceCategorySchema,
  governanceProposalSchema,
  stakingPoolDetailsSchema,
} from './schemas';
import { ContentType, IPFSContentTypes } from '../types/ipfs';

export const validateIPFSContent = (type: ContentType, content: IPFSContentTypes) => {
  if (!content) {
    throw new Error('Content cannot be empty');
  }

  switch (type) {
    case ContentType.coverValidators:
      return coverValidatorsSchema.parse(content);

    case ContentType.coverQuotaShare:
      return coverQuotaShareSchema.parse(content);

    case ContentType.coverAumCoverAmountPercentage:
      return coverAumCoverAmountPercentageSchema.parse(content);

    case ContentType.coverWalletAddress:
      return coverWalletAddressSchema.parse(content);

    case ContentType.coverWalletAddresses:
      return coverWalletAddressesSchema.parse(content);

    case ContentType.coverFreeText:
      return coverFreeTextSchema.parse(content);

    case ContentType.coverDesignatedWallets:
      return coverDesignatedWalletsSchema.parse(content);

    case ContentType.defiPassContent:
      return defiPassContentSchema.parse(content);

    case ContentType.stakingPoolDetails:
      return stakingPoolDetailsSchema.parse(content);

    case ContentType.claimProof:
      return claimProofSchema.parse(content);

    case ContentType.assessmentCriteriaAnswers:
      return assessmentCriteriaAnswersSchema.parse(content);

    case ContentType.governanceProposal:
      return governanceProposalSchema.parse(content);

    case ContentType.governanceCategory:
      return governanceCategorySchema.parse(content);

    default:
      throw new Error(`Invalid content type: ${type}`);
  }
};
