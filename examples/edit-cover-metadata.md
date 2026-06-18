# Edit Cover Metadata

Update proof-of-loss data on an existing cover. Requires an EIP-712 signature from the cover owner.

> All SDK methods return `{ result, error }`. Check `error` before using `result`.

## Setup

```typescript
import { NexusSDK, buildCoverMetadataAuthMessage } from '@nexusmutual/sdk';

const sdk = new NexusSDK({ apiUrl: 'https://api.nexusmutual.io/v2' });
```

## 1. Get Cover

Retrieve the cover to get its `coverMetadataId`.

```typescript
const coverResponse = await sdk.cover.getCover(coverId);
const { coverMetadataId } = coverResponse.result;
```

## 2. Sign Auth Message

Build the EIP-712 typed data and sign it with the cover owner's wallet.

```typescript
const typedData = buildCoverMetadataAuthMessage();

// viem walletClient — in React apps, use wagmi's useSignTypedData hook instead
const signature = await walletClient.signTypedData({
  domain: typedData.domain,
  types: typedData.types,
  primaryType: typedData.primaryType,
  message: typedData.value,
});
```

## 3. Build Proof of Loss

Construct the proof-of-loss entries to submit. Each entry has a `type` and `content` array.

```typescript
import type { ProofOfLossEntry } from '@nexusmutual/sdk';

const proofOfLoss: ProofOfLossEntry[] = [
  {
    type: 'address',
    content: [{ address: '0x...', label: 'My Wallet' }],
  },
];

// Other supported types: 'api_key', 'validator', 'csv', 'free_text'
```

## 4. Edit Metadata

Submit the updated proof-of-loss data with the signed auth message.

```typescript
const response = await sdk.cover.editCoverMetadata({
  coverMetadataId,
  proofOfLoss,
  signature: {
    signature,
    payload: typedData.value,
  },
});
```
