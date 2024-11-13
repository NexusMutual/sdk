const path = require('node:path');

const { addresses, Pool } = require('@nexusmutual/deployments');
const ethers = require('ethers');

/**
 * Retrieves the latest on-chain coverAssets IDs to their corresponding token symbols mapping.
 *
 * @param {ethers.providers.Provider} provider - The Ethereum provider to interact with the blockchain.
 * @returns {Promise<Object>} A promise that resolves to an object mapping cover asset IDs to their symbols.
 */
const getCoverAssetsSymbols = async provider => {
  const BASE_COVER_ASSETS_MAP = { 0: 'ETH', 255: 'NXM' };

  const pool = new ethers.Contract(addresses.Pool, Pool, provider);
  const assets = await pool.getAssets();

  // Filter cover assets
  const coverAssets = assets
    .map(([address, isCoverAsset], assetId) => ({ address, isCoverAsset, assetId }))
    .filter(({ address, isCoverAsset }) => isCoverAsset && address !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE');

  // Get symbol for each cover asset and use assetId as key
  const promises = coverAssets.map(async ({ address, assetId }) => {
    const token = new ethers.Contract(address, ['function symbol() view returns (string)'], provider);
    const symbol = await token.symbol();
    BASE_COVER_ASSETS_MAP[assetId] = symbol;
  });

  await Promise.all(promises);

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
    // 0 is ALL - return ALL coverAssets except NXM
    return Object.values(coverAssetsMap).filter(symbol => symbol !== 'NXM');
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
  getCoverAssetsSymbols,
};
