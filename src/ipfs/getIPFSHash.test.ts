import { ethers } from 'ethers';

import { Ipfs } from './Ipfs';

const VALID_IPFS_CID = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'; // Example CID

describe('get32BytesIPFSHash & getIPFSCidFromHexBytes', () => {
  const ipfsApi = new Ipfs();

  it('should convert a valid IPFS CID to a 32-byte hex string and back', () => {
    const ipfsCid = VALID_IPFS_CID;
    const hexBytes = ipfsApi.get32BytesIPFSHash(ipfsCid);
    const convertedCid = ipfsApi.getIPFSCidFromHexBytes(hexBytes);

    expect(ethers.utils.isHexString(hexBytes)).toBe(true);
    expect(ethers.utils.hexDataLength(hexBytes)).toBe(32);
    expect(convertedCid).toBe(ipfsCid);
  });

  it('should throw an error for an invalid IPFS CID', () => {
    const invalidCid = 'InvalidCID';
    expect(() => ipfsApi.get32BytesIPFSHash(invalidCid)).toThrow();

    const invalidHex = '0x12345';
    expect(() => ipfsApi.getIPFSCidFromHexBytes(invalidHex)).toThrow();
  });

  it('should throw for a valid CIDv1, which does not fit in 32 bytes', () => {
    expect(() => ipfsApi.get32BytesIPFSHash('bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku')).toThrow(
      'Only CIDv0',
    );
    expect(() => ipfsApi.get32BytesIPFSHash('bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi')).toThrow(
      'Only CIDv0',
    );
  });

  it('should throw an error for an empty string', () => {
    expect(() => ipfsApi.get32BytesIPFSHash('')).toThrow('Invalid IPFS hash');
    expect(() => ipfsApi.getIPFSCidFromHexBytes('')).toThrow('Input must be a 32-byte hex string');
  });
});
