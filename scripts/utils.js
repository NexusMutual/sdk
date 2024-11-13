const path = require('node:path');

const { addresses, Pool } = require('@nexusmutual/deployments');
const ethers = require('ethers');

/**
 * Retrieves the latest on-chain coverAssets IDs to their corresponding token symbols mapping.
 *
 * @param {ethers.providers.Provider} provider - The Ethereum provider to interact with the blockchain.
 * @returns {Promise<Object>} A promise that resolves to an object mapping cover asset IDs to their symbols.
 */
const getCoverAssetsMap = async provider => {
  const BASE_COVER_ASSETS_MAP = { 0: 'ETH', 255: 'NXM' };

  const pool = new ethers.Contract(addresses.Pool, Pool, provider);
  const assets = await pool.getAssets();
  console.log('assets: ', assets);

  // Filter for cover assets and exclude ETH address, but keep track of original index
  const coverAssets = assets
    .map((asset, index) => ({ ...asset, assetId: index }))
    .filter(
      ({ 0: address, 1: isCoverAsset }) => isCoverAsset && address !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    );

  // Get symbol for each cover asset and use original index as key
  for (const { 0: address, assetId } of coverAssets) {
    const token = new ethers.Contract(address, ['function symbol() view returns (string)'], provider);
    const symbol = await token.symbol();

    if (!symbol) {
      throw new Error(`Failed to get symbol for token at address ${address}`);
    }

    BASE_COVER_ASSETS_MAP[assetId] = symbol;
  }

  return BASE_COVER_ASSETS_MAP;
};
/**
 * Returns assets array from the integer representation of bit mapping .
 *
 * @param {Integer} coverAsset - The assets that are supported by the product.
 * @return {String[]} Returns assets array.
 */
const parseProductCoverAssets = (coverAssets, coverAssetsMap) => {
  if (coverAssets === 0) {
    return [coverAssetsMap[0], coverAssetsMap[1], coverAssetsMap[6], coverAssetsMap[7]];
  }

  const coverAssetsBinary = coverAssets.toString(2);
  const coverAssetsArray = coverAssetsBinary.split('').reverse();
  const productCoverAssets = [];

  coverAssetsArray.forEach((bit, coverAssetId) => {
    if (bit === '1') {
      productCoverAssets.push(coverAssetsMap[coverAssetId]);
    }
  });

  return productCoverAssets;
};

/**
 * Calculate the bit mapping for the product cover assets.
 *
 * @param {Integer[]} coverAssets - The assets that are supported by the product.
 * @return {Integer} Returns integer representation of bit mapping for product cover assets.
 */
const parseCoverAssetToProductAsset = coverAssets => {
  if (coverAssets.length === 0) {
    return 0;
  }

  return coverAssets.reduce((acc, coverAsset) => acc + Math.pow(2, coverAsset), 0);
};

const parseFilePath = filePath => {
  const fileName = path.basename(filePath);
  const regex = /(\d+)?-?(.+?)\.(\w+$)/;
  const [, id, filename, extension] = fileName.match(regex);

  // Note: `id` will be '001' etc
  return { id, filename, extension };
};

module.exports = {
  parseProductCoverAssets,
  parseCoverAssetToProductAsset,
  parseFilePath,
  getCoverAssetsMap,
};
