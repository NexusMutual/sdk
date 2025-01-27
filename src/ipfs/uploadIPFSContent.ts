import axios from 'axios';

import { ContentType, IPFSContentAndType, IPFSUploadServiceResponse } from '../types/ipfs';

const ethereumAddressRegex = /^(0x[a-f0-9]{40})$/i;

const uploadToIPFS = async (nexusApiUrl: string, ipfsContentAndType: IPFSContentAndType) => {
  const [type, content] = ipfsContentAndType;
  if (!nexusApiUrl) {
    throw new Error('IPFS_GATEWAY_URL is not set');
  }

  // POST data to BE service
  const ipfsHash = await axios
    .post<IPFSUploadServiceResponse>(nexusApiUrl + '/ipfs', { type, content })
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
export const uploadIPFSContent = async (
  nexusApiUrl: string,
  ipfsContentAndType: IPFSContentAndType,
): Promise<string> => {
  const [type, content] = ipfsContentAndType;
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

      if (!['1.0'].includes(version)) {
        throw new Error('Invalid version');
      }

      break;

    case ContentType.coverQuotaShare:
      if (version === '1.0' && !content.quotaShare) {
        throw new Error('Invalid content for coverQuotaShare');
      }

      if (!['1.0'].includes(version)) {
        throw new Error('Invalid version');
      }
      break;

    case ContentType.coverAumCoverAmountPercentage:
      if (version === '1.0' && !content.aumCoverAmountPercentage) {
        throw new Error('Invalid content for coverAumCoverAmountPercentage');
      }

      if (!['1.0'].includes(version)) {
        throw new Error('Invalid version');
      }
      break;

    case ContentType.coverWalletAddress:
      if (version === '1.0' && !content.walletAddress) {
        throw new Error('Invalid content for coverWalletAddress');
      }

      if (!['1.0'].includes(version)) {
        throw new Error('Invalid version');
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

      if (!['1.0', '2.0'].includes(version)) {
        throw new Error('Invalid version');
      }
      break;

    case ContentType.coverFreeText:
      if (version === '1.0' && !content.freeText) {
        throw new Error('Invalid content for coverFreeText');
      }

      if (typeof content.freeText !== 'string') {
        throw new Error('Free text should be a string');
      }

      if (!['1.0'].includes(version)) {
        throw new Error('Invalid version');
      }
      break;

    case 'stakingPoolDetails':
      if (!['1.0'].includes(version)) {
        throw new Error('Invalid version');
      }
      if (!content.poolName || typeof content.poolName !== 'string' || !content.poolName.trim()) {
        throw new Error('poolName must be a non-empty string');
      }
      if (!content.poolDescription || typeof content.poolDescription !== 'string' || !content.poolDescription.trim()) {
        throw new Error('poolDescription must be a non-empty string');
      }
      break;

    case 'claimProof':
      if (!['1.0'].includes(version)) {
        throw new Error('Invalid version');
      }
      if (typeof content.coverId !== 'number' || isNaN(content.coverId)) {
        throw new Error('coverId must be a valid number');
      }
      if (!Array.isArray(content.affectedAddresses) || content.affectedAddresses.length === 0) {
        throw new Error('affectedAddresses must be a non-empty array');
      }
      if (content.affectedAddresses.some(addr => !ethereumAddressRegex.test(addr))) {
        throw new Error('all affected addresses must be valid Ethereum addresses');
      }
      if (!content.affectedChain || typeof content.affectedChain !== 'string' || !content.affectedChain.trim()) {
        throw new Error('affectedChain must be a non-empty string');
      }
      if (
        !content.incidentDescription ||
        typeof content.incidentDescription !== 'string' ||
        !content.incidentDescription.trim()
      ) {
        throw new Error('incidentDescription must be a non-empty string');
      }
      if (!Array.isArray(content.incidentTransactionHashes)) {
        throw new Error('incidentTransactionHashes must be an array');
      }
      if (!Array.isArray(content.incidentEvidenceLinks)) {
        throw new Error('incidentEvidenceLinks must be an array');
      }
      if (!Array.isArray(content.attachedFilesHashes)) {
        throw new Error('attachedFilesHashes must be an array');
      }
      break;

    case 'assessmentCriteriaAnswers':
      if (!['1.0'].includes(version)) {
        throw new Error('Invalid version');
      }
      if (!content.answers || typeof content.answers !== 'object' || Array.isArray(content.answers)) {
        throw new Error('Answers must be an object');
      }
      if (Object.keys(content.answers).length === 0) {
        throw new Error('Answers cannot be empty');
      }
      if (Object.values(content.answers).some(answer => typeof answer !== 'string')) {
        throw new Error('All answers must be strings');
      }
      break;

    case 'governanceProposal':
      if (!['1.0'].includes(version)) {
        throw new Error('Invalid version');
      }
      if (!content.proposal || typeof content.proposal !== 'string' || !content.proposal.trim()) {
        throw new Error('Proposal must be a non-empty string');
      }
      break;

    case 'governanceCategory':
      if (!['1.0'].includes(version)) {
        throw new Error('Invalid version');
      }
      if (!content.category || typeof content.category !== 'string' || !content.category.trim()) {
        throw new Error(`Category must be a non-empty string`);
      }
      break;

    default:
      throw new Error('Invalid content type');
  }

  const hash = await uploadToIPFS(nexusApiUrl, ipfsContentAndType);

  return hash;
};
