# Nexus Mutual SDK

## Installation

```bash
npm install @nexusmutual/sdk
```

## Usage

This package only exports CommonJS modules. You can import it like this:

```js
// Usage with ES6 modules
import { products, productTypes } from '@nexusmutual/sdk';
```

## Nexus Mutual contract addresses and abis

Source of truth for the latest mainnet addresses. Feeds into https://api.nexusmutual.io/sdk/.

## Listed products and product types metadata

The `products` folder contains all protocols listed on Nexus Mutual.

If you're a protocol owner and want to update any details (i.e. logo, website, etc), please submit a PR.
Logos should meet the following criteria:

- svg format, with 1:1 ratio
- no fixed width or height
- the image should reach the edge of the viewbox

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

## IPFS Upload

Use the `uploadIPFSContent` method in `Ipfs` class to upload the content to IPFS. The function takes the following parameters:

- `type`: The type of the content. Based on ContentType enum.
- `content`: The content to be uploaded to IPFS as IPFSContentTypes.

The function returns the IPFS hash of the uploaded content.

For claims submission and assessment IPFS data, use the `get32BytesIPFSHash` method in `Ipfs` class to convert the IPFS hash you get from `uploadIPFSContent` to 32 bytes format. Use the `getIPFSHashFromBytes32` method to convert back to standard IPFS hash.

### Example

```typescript
import { Ipfs } from '@nexusmutual/sdk';

const content: IPFSContentTypes = {
  version: '2.0',
  walletAddresses: ['0x1234567890'],
};

const ipfs = new Ipfs(config: NexusSDKConfig = {});
const ipfsHash = await ipfs.uploadIPFSContent([ContentType.coverWalletAddresses, content]);

console.log(ipfsHash);
```

## Quote

Use the `NexusSDK` or `Quote` class directly to get the inputs required to get a quote and buy cover.

```typescript
interface NexusSDKConfig {
  apiUrl?: string;
}
```

```typescript
const nexusSDK = new NexusSDK(config: NexusSDKConfig = {}, ipfs?: Ipfs)
```

```typescript
const quote = new Quote(config: NexusSDKConfig = {}, ipfs?: Ipfs)
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
   * Optional IPFS CID string or content object to upload
   */
  ipfsCidOrContent?: string | Record<string, unknown>;

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

### Example 1

```typescript
import { NexusSDK } from '@nexusmutual/sdk';

const productId = 247; // Elite Cover Product - Nexus Mutual Cover Product Type
const amount = '100';
const period = 30;
const coverAsset = CoverAsset.ETH;
const paymentAsset = CoverAsset.ETH;
const buyerAddress = '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5';
const ipfsCidOrContent = 'QmXUzXDMbeKSCewUie34vPD7mCAGnshi4ULRy4h7DLmoRS';

const nexusSDK = new NexusSDK();

const { result, error } = await nexusSDK.quote.getQuoteAndBuyCoverInputs({
  productId,
  amount,
  period,
  coverAsset,
  paymentAsset,
  buyerAddress,
  ipfsCidOrContent,
});

console.log(result);
```

### Example 2

```typescript
import { Quote } from '@nexusmutual/sdk';

const productId = 247; // Elite Cover Product - Nexus Mutual Cover Product Type
const amount = '100';
const period = 30;
const coverAsset = CoverAsset.ETH;
const paymentAsset = CoverAsset.ETH;
const buyerAddress = '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5';
const ipfsCidOrContent = 'QmXUzXDMbeKSCewUie34vPD7mCAGnshi4ULRy4h7DLmoRS';

const quote = new Quote();

const { result, error } = await quote.getQuoteAndBuyCoverInputs({
  productId,
  amount,
  period,
  coverAsset,
  paymentAsset,
  buyerAddress,
  ipfsCidOrContent,
});

console.log(result);
```

If the productId's type needs an IPFS upload, you can pass the `ipfsCidOrContent` param and the function will upload the content to IPFS and use the IPFS hash returned or you can pass the hash if you manually uploaded.

The `ipfsCidOrContent` param must be a valid IPFS Cid or a valid `IPFSContentTypes` - the allowed types can be found in `src/types/ipfs.ts`.

### Product Types and IPFS Content Mapping

The following table shows the mapping between product types and their required IPFS content types:

| Product Type               | Content Type                  | Content Structure                                               | Description                  |
| -------------------------- | ----------------------------- | --------------------------------------------------------------- | ---------------------------- |
| ethSlashing                | coverValidators               | <pre>{ version: '1.0', validators: string[] }</pre>             | Array of validator addresses |
| liquidCollectiveEthStaking | coverValidators               | <pre>{ version: '1.0', validators: string[] }</pre>             | Array of validator addresses |
| stakewiseEthStaking        | coverValidators               | <pre>{ version: '1.0', validators: string[] }</pre>             | Array of validator addresses |
| sherlockQuotaShare         | coverQuotaShare               | <pre>{ version: '1.0', quotaShare: number }</pre>               | Percentage value, 0 to 100   |
| unoReQuotaShare            | coverQuotaShare               | <pre>{ version: '1.0', quotaShare: number }</pre>               | Percentage value, 0 to 100   |
| deFiPass                   | coverWalletAddress            | <pre>{ version: '1.0', walletAddress: string }</pre>            | Single wallet address        |
| nexusMutual                | coverWalletAddresses          | <pre>{ version: '1.0', walletAddresses: string }</pre>          | Single wallet address        |
| nexusMutual                | coverWalletAddresses          | <pre>{ version: '2.0', walletAddresses: string[] }</pre>        | Array of wallet addresses    |
| followOn                   | coverFreeText                 | <pre>{ version: '1.0', freeText: string }</pre>                 | Free text description        |
| fundPortfolio              | coverAumCoverAmountPercentage | <pre>{ version: '1.0', aumCoverAmountPercentage: number }</pre> | Percentage value, 0 to 100   |
| generalizedFundPortfolio   | coverAumCoverAmountPercentage | <pre>{ version: '1.0', aumCoverAmountPercentage: number }</pre> | Percentage value, 0 to 100   |

Note: The following product types do not require IPFS content:

- singleProtocol
- custody
- yieldToken
- sherlockExcess
- nativeProtocol
- theRetailMutual
- multiProtocol
- ethSlashingUmbrella
- openCoverTransaction
- sherlockBugBounty
- immunefiBugBounty

For a complete list of products and product types, see [products.json](https://sdk.nexusmutual.io/data/products.json) and [product-types.json](https://sdk.nexusmutual.io/data/product-types.json).

### Validation Errors

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
