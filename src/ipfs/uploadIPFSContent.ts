import axios from 'axios';

import { validateIPFSContent } from './validateIPFSContent';
import { IPFSTypeContentTuple, IPFSUploadServiceResponse } from '../types/ipfs';

const uploadToIPFS = async (nexusApiUrl: string, [type, content]: IPFSTypeContentTuple) => {
  if (!nexusApiUrl) {
    throw new Error('IPFS base URL not set');
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
 * @param {IPFSTypeContentTuple} ipfsTypeContentTuple - A tuple of type of content and the content to be uploaded
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
  ipfsTypeContentTuple: IPFSTypeContentTuple,
  nexusApiUrl: string = 'https://api.nexusmutual.io/v2',
): Promise<string> => {
  const [type, content] = ipfsTypeContentTuple;
  if (!content) {
    throw new Error('Content cannot be empty');
  }

  validateIPFSContent(type, content);

  const hash = await uploadToIPFS(nexusApiUrl, ipfsTypeContentTuple);

  return hash;
};
