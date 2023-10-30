import { parseEther } from 'viem';
import { absBigInt } from '../utils/absBigInt';
import { calculateEthForNxm } from './calculateEthForNxm';
import { calculateSpotPrice } from './calculateSpotPrice';
import { Reserves } from './reserves.type';

// Calculate the price impact when selling NXM for ETH
export const calculatePriceImpactB = (nxmIn: bigint, reserves: Reserves) => {
  const { spotPriceB } = calculateSpotPrice(reserves);
  const ethOut = calculateEthForNxm(nxmIn, reserves);
  const percentage = absBigInt(parseEther('1') - ethOut / spotPriceB) * BigInt(100);
  return percentage;
};
