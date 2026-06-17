const SIGNING_DOMAIN = {
  name: 'Nexus Mutual App',
  version: '1.0.0',
} as const;

const SIGNING_TYPES = {
  Authentication: [
    { name: 'timestamp', type: 'uint256' },
    { name: 'message', type: 'string' },
  ],
} as const;

/**
 * Builds a complete EIP-712 typed-data object for Nexus Mutual API authentication.
 * Pass the returned object to your wallet's `signTypedData` (viem, ethers, etc.).
 */
export function buildAuthTypedData(message: string) {
  return {
    domain: SIGNING_DOMAIN,
    types: SIGNING_TYPES,
    primaryType: 'Authentication' as const,
    value: {
      timestamp: BigInt(Math.floor(Date.now() / 1000)),
      message,
    },
  };
}

const COVER_METADATA_AUTH_MESSAGE =
  'Nexus Mutual (app.nexusmutual.io) wants you to sign in to manage your proof of loss data';

/**
 * Builds a complete EIP-712 typed-data object for cover metadata authentication.
 * Pass the returned object to your wallet's `signTypedData` (viem, ethers, etc.).
 */
export function buildCoverMetadataAuthMessage() {
  return buildAuthTypedData(COVER_METADATA_AUTH_MESSAGE);
}
