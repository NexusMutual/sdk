import { CID } from 'multiformats/cid';

// Wrapper method for IPFS Cid validation
// @throws error if CID is not valid
export const validateIPFSCid = (ipfsCid: string) => {
  CID.parse(ipfsCid);
};
