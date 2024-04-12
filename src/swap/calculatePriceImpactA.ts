import { calculateExactNxmForEth } from './calculateExactNxmForEth';
import { calculateSpotPrice } from './calculateSpotPrice';
import { Reserves } from './reserves.type';

// Calculate the price impact when buying NXM with ETH
export const calculatePriceImpactA = (ethIn: bigint, reserves: Reserves) => {
  const { spotPriceA } = calculateSpotPrice(reserves);
  const nxmOut = calculateExactNxmForEth(ethIn, reserves);
  const nxmOutAtSpotPrice = (BigInt(1e18) * ethIn) / spotPriceA;

  // 100 - 100 * nxmOut / nxmOutAtSpot
  // using BigInt(1000000) to keep 4 decimals of precision
  return BigInt(1000000) - (BigInt(1000000) * nxmOut) / nxmOutAtSpotPrice;
};
