const fs = require('fs');
const path = require('path');
const ethers = require('ethers');
const fetch = require('node-fetch');
const { readdir } = require('fs').promises;

const { Cover, addresses } = require('@nexusmutual/deployments');
const { parseProductCoverAssets } = require('./utils');

const { PROVIDER_URL, IPFS_GATEWAY_URL } = process.env;

const ipfsURL = ipfsHash => `${IPFS_GATEWAY_URL}/ipfs/${ipfsHash}`;

const fetchProductTypes = async cover => {
  const eventFilter = cover.filters.ProductTypeSet();
  const events = await cover.queryFilter(eventFilter);

  // using sort and reduce to deduplicate events and get the latest ipfs hash
  const ipfsHashes = events
    // sort descending by log index to get the latest ipfs hash
    .sort((a, b) => b.logIndex - a.logIndex)
    .reduce((acc, event) => {
      const id = event.args.id.toNumber();
      const coverWordingURL = ipfsURL(event.args.ipfsMetadata);
      return { ...acc, [id]: { id, coverWordingURL } };
    }, {});

  const productTypes = [];

  for (const item of Object.values(ipfsHashes)) {
    const name = await cover.productTypeNames(item.id);
    const { gracePeriod, claimMethod } = await cover.productTypes(item.id);
    productTypes.push({ ...item, name, gracePeriod, claimMethod });
  }

  return productTypes;
};

const createLogoDict = async logosDir => {
  const dirents = await readdir(logosDir, { withFileTypes: true });
  const filenames = dirents.map(dirent => dirent.name);

  const map = filenames.reduce((acc, filename) => {
    const name = filename.substring(filename.indexOf('-') + 1);
    const id = Number(filename.substring(0, filename.indexOf('-')));
    acc[id] = name;
    return acc;
  }, {});

  return map;
};

const fetchProducts = async cover => {
  const eventFilter = cover.filters.ProductSet();
  const events = await cover.queryFilter(eventFilter);

  const logos = await createLogoDict(path.join(__dirname, '../src/logos'));

  const ipfsHashes = events
    // sort descending by log index to get the latest ipfs hash
    .sort((a, b) => b.logIndex - a.logIndex)
    .reduce((acc, event) => {
      const id = event.args.id.toNumber();
      const ipfsHash = event.args.ipfsMetadata;
      return { ...acc, [id]: { id, ipfsHash } };
    }, {});

  const productsCount = await cover.productsCount();
  const ids = Array.from(Array(productsCount.toNumber()).keys());
  const batches = [];

  while (ids.length) {
    batches.push(ids.splice(0, 50));
  }

  const products = [];

  for (const batch of batches) {
    const promises = batch.map(async id => {
      const { productType, isDeprecated, useFixedPrice, coverAssets } = await cover.products(id);
      const name = await cover.productNames(id);
      console.log(`Processing #${id} (${name})`);
      const { ipfsHash } = ipfsHashes[id];
      const metadata = ipfsHash === '' ? {} : await fetch(ipfsURL(ipfsHash)).then(res => res.json());

      if (logos[id] === undefined) {
        throw new Error(`Product id ${id} is missing a logo`);
      }

      return {
        id,
        name,
        productType,
        isDeprecated,
        useFixedPrice,
        logo: logos[id],
        metadata,
        coverAssets: parseProductCoverAssets(coverAssets),
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
  const cover = new ethers.Contract(addresses.Cover, Cover, provider);

  console.log('Generating product types...');
  const productTypesPath = path.join(__dirname, '../generated/product-types.json');
  const productTypes = await fetchProductTypes(cover);
  fs.writeFileSync(productTypesPath, JSON.stringify(productTypes, null, 2));

  console.log('Generating products...');
  const productsPath = path.join(__dirname, '../generated/products.json');
  const products = await fetchProducts(cover);
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

  console.log('Done.');
};

module.exports = {
  buildProducts,
};
