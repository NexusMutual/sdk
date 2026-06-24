# View Cover Metadata

Fetch public and private metadata for an existing cover.

> All SDK methods return `{ result, error }`. Check `error` before using `result`.

## Setup

```typescript
import { NexusSDK, buildCoverMetadataAuthMessage } from '@nexusmutual/sdk';

const sdk = new NexusSDK();
```

## 1. Get Cover

Retrieve the cover to get its `coverMetadataId`.

```typescript
const coverResponse = await sdk.cover.getCover(coverId);
const { coverMetadataId } = coverResponse.result;
```

## 2. View Public Metadata

Public metadata (e.g. quota share, AUM percentage) can be fetched without a signature.

```typescript
const response = await sdk.cover.viewCoverMetadata({ coverMetadataId });
const metadata = response.result;

// metadata.id — metadata record UUID
// metadata.coverId — associated cover ID
// metadata.publicData — { quotaShare?, aumCoverAmountPercentage? }
// metadata.createdAt / metadata.updatedAt
```

## 3. View Private Metadata

Private data (proof-of-loss entries) requires an EIP-712 signature from the cover owner.

```typescript
const typedData = buildCoverMetadataAuthMessage();

// viem walletClient — in React apps, use wagmi's useSignTypedData hook instead
const signature = await walletClient.signTypedData({
  domain: typedData.domain,
  types: typedData.types,
  primaryType: typedData.primaryType,
  message: typedData.value,
});

const response = await sdk.cover.viewCoverMetadata({
  coverMetadataId,
  signature: {
    signature,
    payload: typedData.value,
  },
});

const metadata = response.result;

// metadata.privateData.proofOfLoss — array of ProofOfLossEntry
// metadata.privateData.createdAt — when private data was created
```
