require('dotenv').config();

const fs = require('fs');
const path = require('path');
const ethers = require('ethers');
const fetch = require('node-fetch');

const coverAbi = require('../src/abis/Cover.json');
const addresses = require('../src/addresses.json');
const logos = require('@nexusmutual/logos/dist/data/product-logos.json');
const { parseProductCoverAssets } = require('./utils');

const { PROVIDER_URL, IPFS_GATEWAY_URL } = process.env;

const ipfsURL = ipfsHash => `${IPFS_GATEWAY_URL}/ipfs/${ipfsHash}`;

const fetchProductTypes = async cover => {
  const eventFilter = cover.filters.ProductTypeSet();
  const events = await cover.queryFilter(eventFilter);

  // using sort and reduce to deduplicate events and get the latest ipfs hash
  const ipfsHashes = events
    .sort((a, b) => a.logIndex - b.logIndex)
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

const fetchProducts = async cover => {
  const eventFilter = cover.filters.ProductSet();
  const events = await cover.queryFilter(eventFilter);

  const ipfsHashes = events
    .sort((a, b) => a.logIndex - b.logIndex)
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

const copyRecursiveSync = (src, dest) => {
  const exists = fs.existsSync(src);

  if (!exists) {
    throw new Error(`Source directory ${src} does not exist`);
  }

  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(item => copyRecursiveSync(path.join(src, item), path.join(dest, item)));
    return;
  }

  fs.copyFileSync(src, dest);
};

const main = async () => {
  if (PROVIDER_URL === undefined) {
    console.log('PROVIDER_URL environment variable is not defined');
    process.exit(1);
  }

  if (IPFS_GATEWAY_URL === undefined) {
    console.log('IPFS_GATEWAY_URL environment variable is not defined');
    process.exit(1);
  }

  const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
  const cover = new ethers.Contract(addresses.Cover, coverAbi, provider);

  console.log('Rebuilding dist folder');
  fs.rmSync(path.join(__dirname, '../dist'), { recursive: true, force: true });
  copyRecursiveSync(path.join(__dirname, '../src'), path.join(__dirname, '../dist'));

  console.log('Generating abi exports');
  const abisPath = path.join(__dirname, '../dist/abis');
  const abiExportsFile = path.join(__dirname, '../dist/abis/index.js');

  const abis = fs
    .readdirSync(abisPath)
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));

  const imports = abis.map(abi => `const ${abi} = require('./${abi}.json');`);
  const moduleExports = `module.exports = {\n${abis.map(abi => `  ${abi},`).join('\n')}\n};`;
  fs.writeFileSync(abiExportsFile, [...imports, '', moduleExports, ''].join('\n'));

  console.log('Updating product types');
  const productTypesPath = path.join(__dirname, '../dist/product-types.json');
  const productTypes = await fetchProductTypes(cover);
  fs.writeFileSync(productTypesPath, JSON.stringify(productTypes, null, 2));

  console.log('Updating products');
  const productsPath = path.join(__dirname, '../dist/products.json');
  const products = await fetchProducts(cover);
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

  console.log('Done.');
};

main()
  .catch(err => {
    console.log(err);
    process.exit(1);
  })
  .then(() => process.exit(0));
