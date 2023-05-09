# Nexus Mutual SDK

## Installation

```bash
npm install @nexusmutual/sdk
```

## Usage

This package only exports CommonJS modules. You can import it like this:

```js
// Usage with ES6 modules
import products from '@nexusmutual/sdk/products'
import productTypes from '@nexusmutual/sdk/product-types'
// logos?
```

## Nexus Mutual contract addresses and abis

Source of truth for the latest mainnet addresses. Feeds into https://api.nexusmutual.io/contracts/.

## Listed products and product types metadata

The `products` folder contains all protocols listed on Nexus Mutual.

If you're a protocol owner and want to update any details (i.e. logo, website, etc), please submit a PR.
Logos should meet the following criteria:
- svg format, with 1:1 ratio
- no fixed width or height
- the image should reach the edge of the viewbox
