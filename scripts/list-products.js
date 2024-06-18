require('dotenv').config();

const deployments = require('@nexusmutual/deployments');
const ethers = require('ethers');

if (!process.env.PROVIDER_URL) {
  throw new Error('PROVIDER_URL is required');
}

const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);

const listProducts = async () => {
  const abi = deployments.Cover;
  const address = deployments.addresses.Cover;
  if (!abi || !address) {
    throw new Error(`address or abi not found for Cover contract`);
  }

  console.log('Fetching products...');

  const cover = new ethers.Contract(address, abi, provider);
  const products = await cover.getProducts();
  const productNames = await Promise.all(products.map((_, i) => cover.productNames(i)));

  console.log('Products: \n');
  productNames.forEach((productName, i) => console.log(i, productName));
};

listProducts();
