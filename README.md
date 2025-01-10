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
  version: '2.0.',
  walletAddresses: ['0x1234567890'],
};

const ipfsHash = await uploadIPFSContent(ContentType.coverWalletAddresses, content);

console.log(ipfsHash);
```
