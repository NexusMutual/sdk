import { parseEther } from 'viem';
import { absBigInt } from '../utils/absBigInt';
import { calculateExactEthForNxm } from './calculateExactEthForNxm';
import { calculateSpotPrice } from './calculateSpotPrice';
import { Reserves } from './reserves.type';

// Calculate the price impact when selling NXM for ETH
export const calculatePriceImpactB = (nxmIn: bigint, reserves: Reserves) => {
  const { spotPriceB } = calculateSpotPrice(reserves);
  const ethOut = calculateExactEthForNxm(nxmIn, reserves);
  const ethOutAtSpotPrice = spotPriceB * nxmIn / BigInt(1e18);

  // 100 - 100 * ethOut / ethOutAtSpot
  // using BigInt(1000000) to keep 4 decimals of precision
  return BigInt(1000000) - BigInt(1000000) * ethOut / ethOutAtSpotPrice;
};
