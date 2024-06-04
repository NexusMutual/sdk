const path = require('path');

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

const parseFilePath = filePath => {
  const fileName = path.basename(filePath);
  const regex = /(\d+)?-?(.+?)\.(\w+$)/;
  const [, id, filename, extension] = fileName.match(regex);

  // Note: `id` will be '001' etc
  return { id, filename, extension };
};

module.exports = {
  parseProductCoverAssets,
  parseFilePath,
};
