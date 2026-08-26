# Nexus Mutual SDK

## Installation

```bash
npm install @nexusmutual/sdk
```

## Requirements

- Node.js 22 or newer

## Usage

This package only exports CommonJS modules. You can import it like this:

```js
// Usage with ES6 modules
import { NexusSDK } from '@nexusmutual/sdk';
```

## Nexus Mutual contract addresses and abis

Source of truth for the latest mainnet addresses. Feeds into https://api.nexusmutual.io/sdk/.

## Product metadata

Product and product type metadata is served by the Nexus Mutual API (default base URL `https://api.nexusmutual.io/v2`).
Use the `ProductAPI` class to query products and product types instead of local JSON or logo assets.
For logos, use the URL `https://api.nexusmutual.io/v2/logos/:productId`

### Example

```typescript
import { ProductAPI } from '@nexusmutual/sdk';

const productApi = new ProductAPI();

const productTypes = await productApi.getAllProductTypes();
const product = await productApi.getProductById(247);

console.log(productTypes.length, product.name);
```

`getProductById` and `getProductTypeById` accept an optional `params` array to include additional attributes:

```typescript
const product = await productApi.getProductById(247, ['proofOfLossInputTypes']);
const productType = await productApi.getProductTypeById(1, ['buyCoverForm']);
```

`getAllProducts` returns every product when called with no arguments:

```typescript
const allProducts = await productApi.getAllProducts();
```

It also accepts optional filters, so the API narrows the list instead of the caller filtering the full response:

```typescript
const dexProducts = await productApi.getAllProducts({
  filters: {
    category: [ProductCategoryEnum.Dex, ProductCategoryEnum.Lending],
    productType: [2],
    name: 'aave',
    isPrivate: false,
    isDeprecated: false,
  },
});
```

`name` matches any part of the product name, case-insensitively. The other filters combine as an intersection.

Passing `ids` looks up specific products instead:

```typescript
const products = await productApi.getAllProducts({ ids: [1, 6, 9] });
```

`ids` is a lookup rather than a filter. An unknown id fails the whole request with a 404 `ApiError`, and any `filters` sent alongside it are ignored.

## Quote

Use the `NexusSDK` or `Quote` class directly to get the inputs required to get a quote and buy cover.

```typescript
interface NexusSDKConfig {
  apiUrl?: string;
}
```

```typescript
const nexusSDK = new NexusSDK(config: NexusSDKConfig = {})
```

```typescript
const quote = new Quote(config: NexusSDKConfig = {})
```

### Params

```typescript
export interface GetQuoteAndBuyCoverInputsParams {
  /**
   * ID of the product to buy cover for
   */
  productId: number;

  /**
   * Amount of cover to buy, as a string
   */
  amount: string;

  /**
   * Cover period in days
   */
  period: number;

  /**
   * Asset to use for cover
   * Must be a valid CoverAsset enum value
   */
  coverAsset: number;

  /**
   * Address of the cover buyer
   * Must be a valid Ethereum address
   */
  buyerAddress: string;

  /**
   * ID of the cover to edit
   */
  coverId?: number;

  /**
   * Optional slippage tolerance percentage
   * Value between 0-1 (defaults to 0.001 ~ 0.1%)
   */
  slippage?: number;

  /**
   * Optional IPFS CID string
   */
  ipfsCid?: string;

  /**
   * Optional cover metadata (proof of loss and/or public data)
   * Requires `creatorAddress` — the wallet authorized to view and edit the metadata later
   */
  coverMetadata?: CoverMetadataInput;

  /**
   * Optional commission ratio
   */
  commissionRatio?: number;

  /**
   * Optional address of the commission receiver
   */
  commissionDestination?: string;

  /**
   * Asset to use for cover payment
   * Must be a valid PaymentAsset enum value
   */
  paymentAsset?: number;
}
```

### Cover metadata

Products may require cover metadata (proof of loss data and/or public data like quota share or AUM percentage).
The SDK validates the required metadata based on the product's `proofOfLossInputTypes` and the product type's `buyCoverForm` field,
then uploads it via the cover metadata API automatically.

You can also pass an existing IPFS CID directly via the `ipfsCid` param if you've already uploaded metadata.

#### Creator address

`coverMetadata.creatorAddress` is required whenever `coverMetadata` is passed. It should be the wallet creating the metadata,
usually the same wallet as `buyerAddress`. It must be a valid EVM address. The API records it against the metadata and
authorizes later `viewCoverMetadata` / `editCoverMetadata` calls against it, so a signature from any other wallet
(other than a Safe owned by that address) is rejected.

#### Proof of loss types

Each product may require one or more proof-of-loss entry types, specified in `product.proofOfLossInputTypes`.
The available types and their content structures are:

| Type        | Content Structure                                       |
| ----------- | ------------------------------------------------------- |
| `address`   | `{ address: string, label?: string }`                   |
| `validator` | `{ value: string, label?: string, role?: string }`      |
| `free_text` | `{ value: string, label?: string }`                     |
| `api_key`   | `{ credential: string, label: string, role: string }`   |
| `csv`       | `{ address: string, amount: string, currency: string }` |

#### Public data

Some product types require public data to be set via the `coverMetadata.publicData` field:

| `buyCoverForm` value | Required field                                |
| -------------------- | --------------------------------------------- |
| `withQuotaShare`     | `publicData.quotaShare` (0-100)               |
| `withAUM`            | `publicData.aumCoverAmountPercentage` (0-100) |
| `basic`              | No public data required                       |

### Example

```typescript
import { NexusSDK, CoverAsset } from '@nexusmutual/sdk';

const productId = 247;
const amount = '100';
const period = 30;
const coverAsset = CoverAsset.ETH;
const paymentAsset = CoverAsset.ETH;
const buyerAddress = '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5';

const nexusSDK = new NexusSDK();

const { result, error } = await nexusSDK.quote.getQuoteAndBuyCoverInputs({
  productId,
  amount,
  period,
  coverAsset,
  paymentAsset,
  buyerAddress,
  ipfsCid,
  coverMetadata: {
    creatorAddress: buyerAddress,
    proofOfLoss: [{ type: 'address', content: [{ address: '0x...' }] }],
  },
});

console.log(result);
```

See [examples/buy-cover.md](examples/buy-cover.md) for a full end-to-end example including on-chain transaction submission.

## Cover Metadata

Use the `CoverData` class (or `nexusSDK.cover`) to fetch covers, view cover metadata, and edit proof-of-loss data.

- **Get cover** — `sdk.cover.getCover(coverId)` returns cover details including `coverMetadataId`.
- **View metadata** — `sdk.cover.viewCoverMetadata({ coverMetadataId })` returns public data. Pass an EIP-712 signature to also retrieve private proof-of-loss data.
- **Edit metadata** — `sdk.cover.editCoverMetadata({ coverMetadataId, proofOfLoss, signature })` updates proof-of-loss entries. Requires an EIP-712 signature from the `creatorAddress` the metadata was created with.

See the full walkthroughs:

- [examples/buy-cover.md](examples/buy-cover.md) — get a quote and submit a buy cover transaction
- [examples/view-cover-metadata.md](examples/view-cover-metadata.md) — view public and private metadata
- [examples/edit-cover-metadata.md](examples/edit-cover-metadata.md) — edit proof-of-loss data

## Authentication

The SDK exports EIP-712 helpers for building typed data objects used to authenticate with the Nexus Mutual API.

```typescript
import { buildAuthTypedData, buildCoverMetadataAuthMessage } from '@nexusmutual/sdk';

// Generic auth typed data
const typedData = buildAuthTypedData('Custom message');

// Cover metadata specific auth
const coverAuthTypedData = buildCoverMetadataAuthMessage();
```

Pass the returned object to your wallet's `signTypedData` method (viem, ethers, etc.).

## IPFS Upload

Use the `uploadIPFSContent` method in `Ipfs` class to upload content to IPFS. The function takes the following parameters:

- `type`: The type of the content. Based on ContentType enum.
- `content`: The content to be uploaded to IPFS as IPFSContentTypes.

The function returns the IPFS hash of the uploaded content.

For claims submission and assessment IPFS data, use the `get32BytesIPFSHash` method in `Ipfs` class to convert the IPFS hash you get from `uploadIPFSContent` to 32 bytes format. Use the `getIPFSCidFromHexBytes` method to convert back to standard IPFS hash.

> **Note:** Cover-related content types (validators, quota share, wallet addresses, etc.) have been removed from the IPFS module.
> Cover metadata is now managed through the `CoverData` class and the cover metadata API. See the [Cover Metadata](#cover-metadata) section.

### Example

```typescript
import { Ipfs, ContentType } from '@nexusmutual/sdk';

const ipfs = new Ipfs();

const ipfsHash = await ipfs.uploadIPFSContent([
  ContentType.stakingPoolDetails,
  { version: '1.0', poolName: 'My Pool' },
]);

console.log(ipfsHash);
```

## Development

### Install dependencies

```
npm ci
```

### ENV variables setup

Copy the `.env.example` file into `.env` and populate with the required values.

### Build locally

```
npm build
```

## Validation Errors

IPFS content is validated using [Zod schemas](https://www.npmjs.com/package/zod), if validation fails, the error response will contain a stringified array of Zod validation errors in the `error.message` field. These errors provide detailed information about what went wrong during validation.

Example error response:

```json
{
  "result": undefined,
  "error": {
    "message": "[{\"code\":\"too_small\",\"minimum\":1,\"type\":\"array\",\"inclusive\":true,\"exact\":false,\"message\":\"At least one transaction hash is required\",\"path\":[\"incidentTransactionHashes\"]}]"
  }
}
```

Each Zod error object in the array includes:

- `code`: The type of validation error
- `message`: A human-readable error message
- `path`: The path to the invalid field
- Additional context-specific fields

For more information about Zod error handling and validation, see the [Zod Error Handling documentation](https://zod.dev/?id=error-handling).
