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

const nexusApiUrl = 'https://api.nexusmutual.io/v2'
const content: IPFSContentTypes = {
  version: '2.0.',
  walletAddresses: ['0x1234567890'],
};

const ipfsHash = await uploadIPFSContent(nexusApiUrl, [ContentType.coverWalletAddresses, content]);

console.log(ipfsHash);
```

## getQuoteAndBuyCoverInputs

Use the `getQuoteAndBuyCoverInputs` function from `src/cover/getQuoteAndBuyCoverInputs.ts` to get the inputs required to get a quote and buy cover. The function has 2 overloads. One allows you to pass an IPFS Cid for the cover metadata, and the other allows you to pass the cover metadata directly. The function returns the inputs required to get a quote and buy cover.

### Example

1st overload:

```typescript
import { getQuoteAndBuyCoverInputs } from '@nexusmutual/sdk';

const productId = 1;
const coverAmount = '100';
const coverPeriod = 30;
const coverAsset = CoverAsset.ETH;
const buyerAddress = '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5';
const ipfsCid = 'QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY';

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
import { getQuoteAndBuyCoverInputs, IPFSContentTypes } from '@nexusmutual/sdk';

const productId = 247;
const coverAmount = '100';
const coverPeriod = 30;
const coverAsset = CoverAsset.ETH;
const buyerAddress = '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5';
const ipfsContent: IPFSContentTypes = {
  version: '2.0.',
  walletAddresses: ['0x1234567890'],
};

const quoteAndBuyCoverInputs = await getQuoteAndBuyCoverInputs(
  productId,
  coverAmount,
  coverPeriod,
  coverAsset,
  buyerAddress,
  ipfsContent,
);

console.log(quoteAndBuyCoverInputs);
```

If you pass The `ipfsContent` param, the function will upload the content to IPFS and use the IPFS hash returned for the buy cover inputs `ipfsData` param. If you pass the `ipfsCid` param, the function will use the IPFS hash directly.

The `ipfsCid` param must be a valid IPFS Cid.
The `ipfsContent` param must be a valid `IPFSContentTypes` - the allowed types can be found in `src/types/ipfs.ts`.
