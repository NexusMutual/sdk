import { create } from 'ipfs-http-client';

import { IPFSDataTypes, DEFAULT_VERSION, ContentType } from '../types/ipfs';

const uploadToIPFS = async (data: Record<string, number | string | string[]>) => {
  const ipfsURL = `https://api.nexusmutual.io/ipfs-api/api/v0`;
  const ipfsClient = create({ url: ipfsURL });
  const res = await ipfsClient.add(Buffer.from(JSON.stringify(data)));
  const ipfsHash = res.path;
  await ipfsClient.pin.add(ipfsHash);

  return ipfsHash;
};

/**
 *  Uploads data to IPFS
 * @param {ContentType} type Represents the type of data being uploaded
 * @param  {IPFSDataTypes[typeof type]} data  Represents the data being uploaded in the form of an object
 * @param {string} version  (Optional) Represents the version of the data being uploaded
 * @returns {Promise<string>} Returns the IPFS hash of the uploaded data
 *
 * @example
 * ```ts
 * uploadIPFSData(ContentType.coverValidators, { validators: ['1', '2', '3'] });
 *
 * uploadIPFSData(ContentType.coverQuotaShare, { quotaShare: 25 });
 *
 * uploadIPFSData(ContentType.coverAumCoverAmountPercentage, { aumCoverAmountPercentage: 15 });
 *
 * uploadIPFSData(ContentType.coverWalletAddresses, { walletAddresses: ['0x1', '0x2', '0x3'] });
 *
 * uploadIPFSData(ContentType.coverFreeText, { freeText: 'This is a free text' });
 * ```
 */

export const uploadIPFSData = async <T extends keyof IPFSDataTypes>(
  type: T,
  data: IPFSDataTypes[typeof type],
  version: string = DEFAULT_VERSION,
): Promise<string> => {
  let content;

  if (type === ContentType.coverValidators) {
    content = data as IPFSDataTypes[ContentType.coverValidators];

    if (version === DEFAULT_VERSION && !content.validators) {
      throw new Error('Invalid data for coverValidators');
    }

    if (content.validators.length === 0) {
      throw new Error('Validators cannot be empty');
    }
  }

  if (type === ContentType.coverQuotaShare) {
    content = data as IPFSDataTypes[ContentType.coverQuotaShare];

    if (version === DEFAULT_VERSION && !content.quotaShare) {
      throw new Error('Invalid data for coverQuotaShare');
    }
  }

  if (type === ContentType.coverAumCoverAmountPercentage) {
    content = data as IPFSDataTypes[ContentType.coverAumCoverAmountPercentage];

    if (version === DEFAULT_VERSION && !content.aumCoverAmountPercentage) {
      throw new Error('Invalid data for coverAumCoverAmountPercentage');
    }
  }

  if (type === ContentType.coverWalletAddresses) {
    content = data as IPFSDataTypes[ContentType.coverWalletAddresses];

    if (version === DEFAULT_VERSION && !content.walletAddresses) {
      throw new Error('Invalid data for coverWalletAddresses');
    }

    if (content.walletAddresses.length === 0) {
      throw new Error('Wallet addresses cannot be empty');
    }
  }

  if (type === ContentType.coverFreeText) {
    content = data as IPFSDataTypes[ContentType.coverFreeText];

    if (version === DEFAULT_VERSION && !content.freeText) {
      throw new Error('Invalid data for coverFreeText');
    }
  }

  if (content) {
    const hash = await uploadToIPFS({
      version,
      ...content,
    });
    return hash;
  }

  return '';
};

// uploadIPFSData(ContentType.coverValidators, { validators: ['1', '2', '3'] });

// uploadIPFSData(ContentType.coverQuotaShare, { quotaShare: 25 });

// uploadIPFSData(ContentType.coverAumCoverAmountPercentage, { aumCoverAmountPercentage: 15 });
