# Buy Cover

Get a quote and purchase cover for a DeFi position using the Nexus Mutual SDK.

> All SDK methods return `{ result, error }`. Check `error` before using `result`.

## Setup

```typescript
import { NexusSDK, ProductAPI, CoverAsset, addresses, CoverBroker } from '@nexusmutual/sdk';
import { parseEther } from 'viem';

const sdk = new NexusSDK({ apiUrl: 'https://api.nexusmutual.io/v2' });
const productAPI = new ProductAPI({ apiUrl: 'https://api.nexusmutual.io/v2' });
```

## 1. Load Product

Fetch the product and its product type to discover available cover assets and proof-of-loss requirements.

```typescript
const product = await productAPI.getProductById(productId);
const productType = await productAPI.getProductTypeById(product.productType, ['buyCoverForm']);

// product.coverAssets — available cover assets for this product
// product.proofOfLossInputTypes — required proof-of-loss field types (e.g. ['address', 'api_key'])
```

## 2. Get Quote

Request a quote with the cover parameters. If the product requires proof-of-loss data, pass it in `coverMetadata`.

```typescript
const response = await sdk.quote.getQuoteAndBuyCoverInputs({
  productId,
  amount: parseEther('10').toString(), // cover amount in smallest unit
  period: 30, // days (28–365)
  coverAsset: CoverAsset.ETH,
  buyerAddress: '0x...', // buyer's wallet address
  coverMetadata: {
    proofOfLoss: [
      // required when product.proofOfLossInputTypes is set
      // TODO: the structure for each type will be provided by the API in the future
      { type: 'address', content: [{ address: '0x...', label: 'My Wallet' }] },
    ],
  },
});

const { displayInfo, buyCoverInput } = response.result;

// displayInfo.premiumInAsset — premium to pay (string, smallest unit)
// displayInfo.coverAmount — covered amount (string, smallest unit)
// displayInfo.yearlyCostPerc — annualized cost as a decimal (e.g. 0.025 = 2.5%)
// displayInfo.maxCapacity — maximum available capacity
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
const value = buyCoverParams.coverAsset === CoverAsset.ETH
  ? BigInt(buyCoverParams.maxPremiumInAsset)
  : BigInt(0);

// viem walletClient — in React apps, use wagmi's useWriteContract hook instead
const txHash = await walletClient.writeContract({
  address: addresses.CoverBroker as `0x${string}`,
  abi: CoverBroker,
  functionName: 'buyCover',
  args: [params, allocations],
  value,
});
```
