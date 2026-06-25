# Edit Cover Metadata

Update proof-of-loss data on an existing cover. Requires an EIP-712 signature from the cover owner.

> All SDK methods return `{ result, error }`. Check `error` before using `result`.

## Setup

```typescript
import { NexusSDK, ProductAPI, buildCoverMetadataAuthMessage } from '@nexusmutual/sdk';

const sdk = new NexusSDK();
const productAPI = new ProductAPI();
```

## 1. Get Cover and Product

Retrieve the cover to get its `coverMetadataId` and `productId`, then fetch the product to discover the required proof-of-loss types.

```typescript
const coverResponse = await sdk.cover.getCover(coverId);
const { coverMetadataId, productId } = coverResponse.result;

const product = await productAPI.getProductById(productId);
// product.proofOfLossInputTypes — required types (e.g. ['address', 'validator'])
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

Construct proof-of-loss entries based on the product's required types. Each entry has a `type` and `content` array.

```typescript
import type { ProofOfLossEntry } from '@nexusmutual/sdk';

// Build one entry per required type from product.proofOfLossInputTypes
const proofOfLoss: ProofOfLossEntry[] = product.proofOfLossInputTypes.map(type => {
  switch (type) {
    case 'address':
      return { type, content: [{ address: '0x...', label: 'My Wallet' }] };
    case 'validator':
      return { type, content: [{ value: '1008', label: 'Validator 8' }] };
    case 'free_text':
      return { type, content: [{ value: '43543534123' }] };
    case 'api_key':
      return { type, content: [{ credential: 'key-value', label: 'Secret Key', role: 'api_key' }] };
    case 'csv':
      return { type, content: [{ address: '0x...', amount: '1000', currency: 'USDC' }] };
  }
});
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
