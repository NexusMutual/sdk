import { AxiosRequestConfig } from 'axios';
import { ethers } from 'ethers';
import isIPFS from 'is-ipfs';

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
import { version as sdkVersion } from '../../generated/version.json';
import { NexusSDKBase } from '../nexus-sdk-base';
import { ContentType, IPFSContentTypes, IPFSTypeContentTuple, IPFSUploadServiceResponse } from '../types/ipfs';
import { NexusSDKConfig } from '../types/sdk';

/**
 * Class for handling IPFS-related functionality
 */
export class Ipfs extends NexusSDKBase {
  /**
   * Create a new IPFS instance
   * @param config SDK configuration
   */
  constructor(config: NexusSDKConfig = {}) {
    super(config);
  }

  /**
   * Upload content to IPFS
   * @param ipfsTypeContentTuple Tuple of content type and content
   * @returns IPFS CID
   */
  public async uploadIPFSContent(ipfsTypeContentTuple: IPFSTypeContentTuple): Promise<string> {
    const [type, content] = ipfsTypeContentTuple;

    if (!content) {
      throw new Error('Content cannot be empty');
    }

    // Validate content before uploading
    this.validateIPFSContent(type, content);

    const ipfsUploadUrl = '/ipfs';
    const options: AxiosRequestConfig = {
      method: 'POST',
      params: { sdk: sdkVersion },
      data: { type, content },
    };

    try {
      const response = await this.sendRequest<IPFSUploadServiceResponse>(ipfsUploadUrl, options);

      const ipfs32Bytes = ethers.utils.hexlify(ethers.utils.base58.decode(response.ipfsHash).slice(2));

      const ipfsHash = type === ContentType.claimProof ? ipfs32Bytes : response.ipfsHash; // Use 32bytes for claimProof

      return ipfsHash;
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Failed to upload data to IPFS', { cause: error });
    }
  }

  /**
   * Validate IPFS CID format
   * @param cid IPFS CID to validate
   * @returns True if valid, false otherwise
   */
  public validateIPFSCid(cid: string): boolean {
    return isIPFS.cid(cid);
  }

  /**
   * Validate IPFS content structure
   * @param type Content type
   * @param content Content to validate
   * @returns Validated content
   */
  public validateIPFSContent(type: ContentType, content: IPFSContentTypes) {
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
  }
}
