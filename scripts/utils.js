const path = require('path');

/**
 * Returns assets array from the integer representation of bit mapping .
 *
 * @param {Integer} coverAsset - The assets that are supported by the product.
 * @return {String[]} Returns assets array.
 */
const parseProductCoverAssets = coverAssets => {
  const COVER_ASSETS_MAP = {
    0: 'ETH',
    1: 'DAI',
    6: 'USDC',
    255: 'NXM',
  };

  if (coverAssets === 0) {
    return [COVER_ASSETS_MAP[0], COVER_ASSETS_MAP[1], COVER_ASSETS_MAP[6]];
  }

  const coverAssetsBinary = coverAssets.toString(2);
  const coverAssetsArray = coverAssetsBinary.split('').reverse();
  const productCoverAssets = [];

  coverAssetsArray.forEach((bit, coverAssetId) => {
    if (bit === '1') {
      productCoverAssets.push(COVER_ASSETS_MAP[coverAssetId]);
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
};
