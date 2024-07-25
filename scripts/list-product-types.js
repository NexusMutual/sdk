require('dotenv').config();

const deployments = require('@nexusmutual/deployments');
const ethers = require('ethers');

if (!process.env.PROVIDER_URL) {
  throw new Error('PROVIDER_URL is required');
}

const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);

const listProductsTypes = async () => {
  const abi = deployments.CoverProducts;
  const address = deployments.addresses.CoverProducts;
  if (!abi || !address) {
    throw new Error(`address or abi not found for CoverProducts contract`);
  }

  console.log('Fetching products types...\n');

  const coverProducts = new ethers.Contract(address, abi, provider);
  const productsTypeCount = await coverProducts.getProductTypeCount();
  const productTypeNames = await Promise.all(
    Array.from({ length: productsTypeCount }, (_, i) => coverProducts.getProductTypeName(i)),
  );

  console.log('Products Types: \n');
  productTypeNames.forEach((productTypeName, i) => console.log(i, productTypeName));
};

listProductsTypes();
