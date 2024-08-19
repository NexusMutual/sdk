const fs = require('fs');
const { readdir } = require('fs').promises;
const path = require('path');

const { CoverProducts, addresses } = require('@nexusmutual/deployments');
const ethers = require('ethers');
const fetch = require('node-fetch');

const { parseProductCoverAssets, parseFilePath } = require('./utils');
const { allPrivateProductsIds } = require(path.join(__dirname, '../src/constants/privateProducts.js'));
const productMetadata = require('../data/legacy-product-metadata.json');

const { PROVIDER_URL, IPFS_GATEWAY_URL } = process.env;

const ipfsURL = ipfsHash => `${IPFS_GATEWAY_URL}/ipfs/${ipfsHash}`;

const fetchProductTypes = async coverProducts => {
  const productTypesCount = (await coverProducts.getProductTypeCount()).toNumber();
  const productTypes = [];

  for (let id = 0; id < productTypesCount; id++) {
    const { gracePeriod, claimMethod } = await coverProducts.getProductType(id);
    const name = await coverProducts.getProductTypeName(id);
    const { ipfsHash } = await coverProducts.getLatestProductTypeMetadata(id);
    const coverWordingURL = ipfsURL(ipfsHash);
    productTypes.push({ id, coverWordingURL, name: name.trim(), gracePeriod, claimMethod });
  }

  return productTypes;
};

const createLogoDict = async logosDir => {
  const dirents = await readdir(logosDir, { withFileTypes: true });
  const filenames = dirents.map(dirent => dirent.name);

  const map = filenames.reduce((acc, filename) => {
    const { id, filename: name, extension } = parseFilePath(filename);

    // Skip files that don't have an id. These files have no id in the filename and will never be
    // used in a product
    if (id) {
      acc[Number(id)] = `${name}.${extension}`;
    }

    return acc;
  }, {});

  return map;
};

const fetchProducts = async (coverProducts, provider) => {
  const eventFilter = coverProducts.filters.ProductSet();
  const events = await coverProducts.queryFilter(eventFilter);

  const logos = await createLogoDict(path.join(__dirname, '../src/logos'));

  const sortedEvents = events
    // sort ascending by blockNumber to get the latest ipfs hash
    // (ascending rather than descending due to the reduce into productMetadata object below)
    .sort((a, b) => a.blockNumber - b.blockNumber);

  await Promise.all(
    sortedEvents.map(async event => {
      const id = event.args.id.toNumber();
      const { ipfsHash } = await coverProducts.getLatestProductMetadata(id);
      productMetadata[id] = { id, ipfsHash };

      // Only update the timestamp if it's not already set
      // This is to avoid overwriting the timestamp if the event was an update, not a creation (e.g. for ipfsMetadata)
      if (!productMetadata[id].timestamp) {
        const block = await provider.getBlock(event.blockNumber);
        productMetadata[id].timestamp = block.timestamp;
      }
    }),
  );

  const productsCount = await coverProducts.getProductCount();
  const ids = Array.from(Array(productsCount.toNumber()).keys());
  const batches = [];

  while (ids.length) {
    batches.push(ids.splice(0, 50));
  }

  const products = [];

  for (const batch of batches) {
    const promises = batch.map(async id => {
      const { productType, isDeprecated, useFixedPrice, coverAssets } = await coverProducts.getProduct(id);
      const name = await coverProducts.getProductName(id);
      console.log(`Processing #${id} (${name})`);
      const { ipfsHash, timestamp } = productMetadata[id];
      const metadata = ipfsHash === '' ? {} : await fetch(ipfsURL(ipfsHash)).then(res => res.json());

      if (logos[id] === undefined) {
        throw new Error(`Product id ${id} is missing a logo`);
      }

      const isPrivate = allPrivateProductsIds.includes(id);

      return {
        id,
        name,
        productType,
        isDeprecated,
        useFixedPrice,
        logo: logos[id],
        metadata,
        coverAssets: parseProductCoverAssets(coverAssets),
        isPrivate,
        timestamp,
      };
    });

    const batchProducts = await Promise.all(promises);
    products.push(...batchProducts);
  }

  return products;
};

const buildProducts = async () => {
  if (PROVIDER_URL === undefined) {
    console.log('PROVIDER_URL environment variable is not defined');
    process.exit(1);
  }

  if (IPFS_GATEWAY_URL === undefined) {
    console.log('IPFS_GATEWAY_URL environment variable is not defined');
    process.exit(1);
  }

  const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
  const coverProducts = new ethers.Contract(addresses.CoverProducts, CoverProducts, provider);

  console.log('Generating product types...');
  const productTypesPath = path.join(__dirname, '../generated/product-types.json');
  const productTypes = await fetchProductTypes(coverProducts);
  fs.writeFileSync(productTypesPath, JSON.stringify(productTypes, null, 2));

  console.log('Generating products...');
  const productsPath = path.join(__dirname, '../generated/products.json');
  const products = await fetchProducts(coverProducts, provider);
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

  console.log('Done.');
};

module.exports = {
  buildProducts,
};
