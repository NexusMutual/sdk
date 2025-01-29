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

## IPFS Upload Utils

Use the `uploadIPFSContent` function from `src/ipfs/uploadIPFSContent.ts` to upload the content to IPFS. The function takes the following parameters:

- `type`: The type of the content. Based on ContentType enum.
- `content`: The content to be uploaded to IPFS as IPFSContentTypes.

The function returns the IPFS hash of the uploaded content.

### Example

```typescript
import { uploadIPFSContent, ContentType, IPFSContentTypes } from '@nexusmutual/sdk';

const content: IPFSContentTypes = {
  version: '2.0',
  walletAddresses: ['0x1234567890'],
};

const ipfsHash = await uploadIPFSContent([ContentType.coverWalletAddresses, content]);

console.log(ipfsHash);
```

## getQuoteAndBuyCoverInputs

Use the `getQuoteAndBuyCoverInputs` function from `src/cover/getQuoteAndBuyCoverInputs.ts` to get the inputs required to get a quote and buy cover. The function has 2 overloads. One allows you to pass an IPFS Cid for the cover metadata, and the other allows you to pass the cover metadata directly. The function returns the inputs required to get a quote and buy cover.

### Example

1st overload:

```typescript
import { CoverAsset, getQuoteAndBuyCoverInputs } from '@nexusmutual/sdk';

const productId = 247; // Elite Cover Product - Nexus Mutual Cover Product Type
const coverAmount = '100';
const coverPeriod = 30;
const coverAsset = CoverAsset.ETH;
const buyerAddress = '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5';
const ipfsCid = 'QmXUzXDMbeKSCewUie34vPD7mCAGnshi4ULRy4h7DLmoRS';

const quoteAndBuyCoverInputs = await getQuoteAndBuyCoverInputs(
  productId,
  coverAmount,
  coverPeriod,
  coverAsset,
  buyerAddress,
  undefined,
  ipfsCid,
);

console.log(quoteAndBuyCoverInputs);
```

2nd overload:

```typescript
import { CoverAsset, getQuoteAndBuyCoverInputs, IPFSContentTypes } from '@nexusmutual/sdk';

const productId = 247; // Elite Cover Product - Nexus Mutual Cover Product Type
const coverAmount = '100';
const coverPeriod = 30;
const coverAsset = CoverAsset.ETH;
const buyerAddress = '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5';
const ipfsContent: IPFSContentTypes = {
  version: '2.0',
  walletAddresses: ['0x1234567890123456789012345678901234567890'],
};

const quoteAndBuyCoverInputs = await getQuoteAndBuyCoverInputs(
  productId,
  coverAmount,
  coverPeriod,
  coverAsset,
  buyerAddress,
  undefined,
  ipfsContent,
);

console.log(quoteAndBuyCoverInputs);
```

If the productId's type needs an IPFS upload, you can pass the `ipfsContent` param and the function will upload the content to IPFS and use the IPFS hash returned for the buy cover inputs `ipfsData` param. If you pass the `ipfsCid` param, the function will use the IPFS hash directly.

The `ipfsCid` param must be a valid IPFS Cid.
The `ipfsContent` param must be a valid `IPFSContentTypes` - the allowed types can be found in `src/types/ipfs.ts`.

### Product Types and IPFS Content Mapping

The following table shows the mapping between product types and their required IPFS content types:

| Product Type | Content Type | Content Structure | Description |
|-------------|--------------|-------------------|-------------|
| ethSlashing | coverValidators | <pre>{ version: '1.0', validators: string[] }</pre> | Array of validator addresses |
| liquidCollectiveEthStaking | coverValidators | <pre>{ version: '1.0', validators: string[] }</pre> | Array of validator addresses |
| stakewiseEthStaking | coverValidators | <pre>{ version: '1.0', validators: string[] }</pre> | Array of validator addresses |
| sherlockQuotaShare | coverQuotaShare | <pre>{ version: '1.0', quotaShare: number }</pre> | Percentage value, 0 to 100 |
| unoReQuotaShare | coverQuotaShare | <pre>{ version: '1.0', quotaShare: number }</pre> | Percentage value, 0 to 100 |
| deFiPass | coverWalletAddress | <pre>{ version: '1.0', walletAddress: string }</pre> | Single wallet address |
| nexusMutual | coverWalletAddresses | <pre>{ version: '1.0', walletAddresses: string }</pre> | Single wallet address |
| nexusMutual | coverWalletAddresses | <pre>{ version: '2.0', walletAddresses: string[] }</pre> | Array of wallet addresses |
| followOn | coverFreeText | <pre>{ version: '1.0', freeText: string }</pre> | Free text description |
| fundPortfolio | coverAumCoverAmountPercentage | <pre>{ version: '1.0', aumCoverAmountPercentage: number }</pre> | Percentage value, 0 to 100 |
| generalisedFundPortfolio | coverAumCoverAmountPercentage | <pre>{ version: '1.0', aumCoverAmountPercentage: number }</pre> | Percentage value, 0 to 100 |

Note: The following product types do not require IPFS content:
- protocol
- custody
- yieldToken
- sherlockExcess
- nativeProtocol
- theRetailMutual
- bundledProtocol
- ethSlashingUmbrella
- openCoverTransaction
- sherlockBugBounty
- immunefiBugBounty

For a complete list of products and product types, see [products.json](https://sdk.nexusmutual.io/data/products.json) and [product-types.json](https://sdk.nexusmutual.io/data/product-types.json).
