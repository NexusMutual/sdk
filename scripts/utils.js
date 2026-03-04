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

/**
 * Runs async tasks with a concurrency limit to avoid overwhelming the RPC.
 *
 * @param {Array<{ fromBlock: number, toBlock: number }>} items - Items to process.
 * @param {number} concurrency - Max number of concurrent tasks.
 * @param {function} fn - Async function (item) => Promise<ethers.Event[]>
 * @param {number} [retries=2] - Number of retries per batch on failure.
 * @returns {Promise<ethers.Event[][]>} Results per batch.
 */
const runWithConcurrency = async (items, concurrency, fn, retries = 2) => {
  const results = [];
  let index = 0;

  const runNext = async () => {
    if (index >= items.length) {
      return;
    }
    const currentIndex = index++;
    const item = items[currentIndex];
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await fn(item);
        results[currentIndex] = result;
        return;
      } catch (err) {
        lastError = err;
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  };

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () =>
    (async () => {
      while (index < items.length) {
        await runNext();
      }
    })(),
  );
  await Promise.all(workers);
  return results;
};

/**
 * Fetches events in batches to avoid RPC limitations and timeouts.
 * Uses limited concurrency and smaller batches to reduce per-request load and retries on failure.
 *
 * @param {ethers.Contract} contract - The contract to query events from.
 * @param {ethers.EventFilter} eventFilter - The event filter to apply.
 * @param {number} startBlock - The starting block number.
 * @param {ethers.providers.Provider} provider - The Ethereum provider to interact with the blockchain.
 * @param {number} [batchSize=5000] - The number of blocks to query per batch (smaller = less timeout risk).
 * @param {number} [concurrency=20] - Max concurrent batch requests (avoids overwhelming the RPC).
 * @param {number} [retries=2] - Retries per batch with exponential backoff on failure.
 * @returns {Promise<ethers.Event[]>} A promise that resolves to an array of events.
 */
const fetchEventsInBatches = async (
  contract,
  eventFilter,
  startBlock,
  provider,
  batchSize = 5000,
  concurrency = 20,
  retries = 2,
) => {
  const endBlock = await provider.getBlockNumber();
  const batches = [];

  for (let fromBlock = startBlock; fromBlock <= endBlock; fromBlock += batchSize) {
    const toBlock = Math.min(fromBlock + batchSize - 1, endBlock);
    batches.push({ fromBlock, toBlock });
  }

  const batchResults = await runWithConcurrency(
    batches,
    concurrency,
    ({ fromBlock, toBlock }) => contract.queryFilter(eventFilter, fromBlock, toBlock),
    retries,
  );

  return batchResults.flat();
};

module.exports = {
  parseProductCoverAssets,
  parseCoverAssetToProductAsset,
  parseFilePath,
  getCoverAssetsSymbols,
  fetchEventsInBatches,
};
