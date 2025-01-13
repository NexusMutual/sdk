import axios from 'axios';

import { IPFSContentTypes, ContentType, IPFSContentAndType, IPFSUploadServiceResponse } from '../types/ipfs';

// TODO update when BE service is ready
const uploadToIPFS = async (data: IPFSContentTypes) => {
  const ipfsURL = process.env.IPFS_API_URL;

  if (!ipfsURL) {
    throw new Error('IPFS_API_URL is not set');
  }

  // POST data to BE service
  const ipfsHash = await axios
    .post<IPFSUploadServiceResponse>(ipfsURL, data)
    .then(response => response.data.ipfsHash)
    .catch(error => {
      console.error('Error:', error);
      throw new Error('Failed to upload data to IPFS');
    });

  return ipfsHash;
};

/**
 *  Uploads data to IPFS
 * @param {IPFSContentAndType} typeAndContent  - The type of content and the content to be uploaded
 * @returns {Promise<string>} hash Returns the IPFS hash of the uploaded data
 *
 * @example
 * ```ts
 * uploadIPFSData(ContentType.coverValidators, { version: '1.0', validators: ['1', '2', '3'] });
 *
 * uploadIPFSData(ContentType.coverQuotaShare, { version: '1.0', quotaShare: 25 });
 *
 * uploadIPFSData(ContentType.coverAumCoverAmountPercentage, { version: '1.0', aumCoverAmountPercentage: 15 });
 *
 * uploadIPFSData(ContentType.coverWalletAddresses, { version: '1.0', walletAddresses: ['0x1', '0x2', '0x3'] });
 *
 * uploadIPFSData(ContentType.coverFreeText, { version: '1.0', freeText: 'This is a free text' });
 * ```
 */

export const uploadIPFSContent = async (...[type, content]: IPFSContentAndType): Promise<string> => {
  if (!content) {
    throw new Error('Content cannot be empty');
  }

  const version = content.version;

  switch (type) {
    case ContentType.coverValidators:
      if (version === '1.0' && !content.validators) {
        throw new Error('Invalid content for coverValidators');
      }

      if (content.validators.length === 0) {
        throw new Error('Validators cannot be empty');
      }
      break;

    case ContentType.coverQuotaShare:
      if (version === '1.0' && !content.quotaShare) {
        throw new Error('Invalid content for coverQuotaShare');
      }
      break;

    case ContentType.coverAumCoverAmountPercentage:
      if (version === '1.0' && !content.aumCoverAmountPercentage) {
        throw new Error('Invalid content for coverAumCoverAmountPercentage');
      }
      break;

    case ContentType.coverWalletAddress:
      if (version === '1.0' && !content.walletAddress) {
        throw new Error('Invalid content for coverWalletAddress');
      }
      break;

    case ContentType.coverWalletAddresses:
      if (version === '1.0') {
        if (!content.walletAddresses || content.walletAddresses.length === 0) {
          throw new Error('Wallet addresses cannot be empty');
        }

        // check for comma separation
        if (content.walletAddresses.includes(',')) {
          throw new Error('Invalid content for coverWalletAddresses. Wallet addresses should be separated by a comma');
        }
      }

      if (version === '2.0') {
        if (!content.walletAddresses || content.walletAddresses.length === 0) {
          throw new Error('Wallet addresses cannot be empty');
        }
      }
      break;

    case ContentType.coverFreeText:
      if (version === '1.0' && !content.freeText) {
        throw new Error('Invalid content for coverFreeText');
      }

      if (typeof content.freeText !== 'string') {
        throw new Error('Free text should be a string');
      }
      break;

    default:
      throw new Error('Invalid content type');
  }

  const hash = await uploadToIPFS(content);
  return hash;
};
