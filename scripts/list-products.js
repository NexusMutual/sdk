require('dotenv').config();

const deployments = require('@nexusmutual/deployments');
const ethers = require('ethers');

if (!process.env.PROVIDER_URL) {
  throw new Error('PROVIDER_URL is required');
}

const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);

/**
 * Asynchronously lists products with optional argument to list only the last N products
 *
 * npm run list:products // lists all products
 * npm run list:products 20 // lists the last 20 products
 */
const listProducts = async () => {
  const count = process.argv[2];
  const abi = deployments.CoverProducts;
  const address = deployments.addresses.CoverProducts;
  if (!abi || !address) {
    throw new Error(`address or abi not found for CoverProducts contract`);
  }

  console.log('Fetching products...');

  const coverProducts = new ethers.Contract(address, abi, provider);
  const productsCount = await coverProducts.getProductCount();

  let productIds;
  if (count) {
    // grab the last n items equal to count
    const start = Math.max(0, productsCount - parseInt(count));
    const end = productsCount;
    productIds = Array.from({ length: end - start }, (_, i) => i + start);
  } else {
    productIds = Array.from({ length: productsCount }, (_, i) => i);
  }

  const products = await Promise.all(productIds.map(async id => ({ id, name: await coverProducts.productNames(id) })));
  console.log('Products: \n');
  products.forEach(product => console.log(product.id, product.name));
};

listProducts();
