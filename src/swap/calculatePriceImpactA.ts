import { parseEther } from 'viem';
import { absBigInt } from '../utils/absBigInt';
import { calculateNxmForEth } from './calculateNxmForEth';
import { calculateSpotPrice } from './calculateSpotPrice';
import { Reserves } from './reserves.type';

// Calculate the price impact when buying NXM with ETH
export const calculatePriceImpactA = (ethIn: bigint, reserves: Reserves) => {
  const { spotPriceA } = calculateSpotPrice(reserves);
  const nxmOut = calculateNxmForEth(ethIn, reserves);
  const percentage = absBigInt(parseEther('1') - nxmOut / spotPriceA) * BigInt(100);
  return percentage;
};
