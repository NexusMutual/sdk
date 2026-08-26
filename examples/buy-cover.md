# Buy Cover

Get a quote and purchase cover for a DeFi position using the Nexus Mutual SDK.

> All SDK methods return `{ result, error }`. Check `error` before using `result`.

## Setup

```typescript
import { NexusSDK, ProductAPI, CoverAsset, addresses, CoverBroker } from '@nexusmutual/sdk';
import { parseEther } from 'viem';

const sdk = new NexusSDK();
const productAPI = new ProductAPI();
```

## 1. Load Product

Fetch the product and its product type to discover available cover assets and proof-of-loss requirements.

```typescript
const product = await productAPI.getProductById(productId);
const productType = await productAPI.getProductTypeById(product.productType);

// product.coverAssets — available cover assets for this product
// product.proofOfLossInputTypes — required proof-of-loss field types (e.g. ['address', 'validator'])
```

## 2. Get Quote

Request a quote with the cover parameters. If the product requires proof-of-loss data, pass it in `coverMetadata`.

```typescript
// Each entry in proofOfLoss corresponds to a type from product.proofOfLossInputTypes.
// For example, if proofOfLossInputTypes is ['address'], you'd pass:
// proofOfLoss: [{ type: 'address', content: [{ address: '0x...' }] }]

const response = await sdk.quote.getQuoteAndBuyCoverInputs({
  productId,
  amount: parseEther('10').toString(), // cover amount in smallest unit
  period: 30, // days (28–365)
  coverAsset: CoverAsset.ETH,
  buyerAddress: '0x...', // buyer's wallet address
  coverMetadata: {
    creatorAddress: '0x...', // wallet authorized to view/edit this metadata later
    proofOfLoss: product.proofOfLossInputTypes?.map(type => buildEntry(type)),
  },
});

const { displayInfo, buyCoverInput } = response.result;

// displayInfo.premiumInAsset — premium to pay (string, smallest unit)
// displayInfo.coverAmount — covered amount (string, smallest unit)
// displayInfo.yearlyCostPerc — annualized cost as a decimal (e.g. 0.025 = 2.5%)
// displayInfo.maxCapacity — maximum available capacity
```

### Proof of Loss Entry Structures

Each type in `product.proofOfLossInputTypes` requires a matching entry. The `ProofOfLossEntry` type and its content types (`AddressValue`, `ValidatorValue`, `FreeTextValue`, `ApiKeyValue`, `CsvValue`) are exported from `@nexusmutual/sdk`.

```typescript
import type { ProofOfLossEntry } from '@nexusmutual/sdk';

// address — EVM addresses
{ type: 'address', content: [{ address: '0x...', label?: 'Company Wallet' }] }

// validator — validator public keys
{ type: 'validator', content: [{ value: '1008', label?: 'Validator 8' }] }

// free_text — Specific detail about a cover
{ type: 'free_text', content: [{ value: 'Customer 9504' }] }

// api_key — service credentials
{ type: 'api_key', content: [{ credential: 'key-value', label: 'Read Key', role: 'read' }] }

// csv — address + amount + currency tuples
{ type: 'csv', content: [{ address: '0x...', amount: '1000', currency: 'USDC' }] }
```

## 3. Submit Transaction

Extract the buy cover params and pool allocations from the quote, then submit the on-chain transaction.

```typescript
const { buyCoverParams, poolAllocationRequests } = buyCoverInput;

const params = {
  coverId: BigInt(buyCoverParams.coverId),
  owner: buyCoverParams.owner as `0x${string}`,
  productId: buyCoverParams.productId,
  coverAsset: buyCoverParams.coverAsset,
  amount: BigInt(buyCoverParams.amount),
  period: buyCoverParams.period,
  maxPremiumInAsset: BigInt(buyCoverParams.maxPremiumInAsset),
  paymentAsset: buyCoverParams.paymentAsset,
  commissionRatio: buyCoverParams.commissionRatio,
  commissionDestination: buyCoverParams.commissionDestination as `0x${string}`,
  ipfsData: buyCoverParams.ipfsData,
};

const allocations = poolAllocationRequests.map(r => ({
  poolId: BigInt(r.poolId),
  coverAmountInAsset: BigInt(r.coverAmountInAsset),
  skip: r.skip,
}));

// Send ETH value when paying with ETH, otherwise 0
const value = buyCoverParams.coverAsset === CoverAsset.ETH ? BigInt(buyCoverParams.maxPremiumInAsset) : BigInt(0);

// viem walletClient — in React apps, use wagmi's useWriteContract hook instead
const txHash = await walletClient.writeContract({
  address: addresses.CoverBroker as `0x${string}`,
  abi: CoverBroker,
  functionName: 'buyCover',
  args: [params, allocations],
  value,
});
```
