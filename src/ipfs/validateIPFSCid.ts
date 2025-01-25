import { CID } from 'multiformats';

/**
 * Wrapper method for IPFS CID string validation
 *
 * @param ipfsCid - The CID string to validate.
 * @throws Throw an error if CID is not valid
 */
export const validateIPFSCid = (ipfsCid: string): void => {
  CID.parse(ipfsCid);
};
