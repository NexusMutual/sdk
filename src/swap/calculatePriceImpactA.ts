import { parseEther } from 'viem';
import { absBigInt } from '../utils/absBigInt';
import { calculateNxmForEth } from './calculateNxmForEth';
import { calculateSpotPrice } from './calculateSpotPrice';
import { Reserves } from './reserves.type';

// Calculate the price impact when buying NXM with ETH
export const calculatePriceImpactA = (ethIn: bigint, reserves: Reserves) => {
  const { spotPriceA } = calculateSpotPrice(reserves);
  const nxmOut = calculateNxmForEth(ethIn, reserves);
  const nxmOutAtSpotPrice = BigInt(1e18) * ethIn / spotPriceA;

  // 100 - 100 * nxmOut / nxmOutAtSpot
  const priceImpactRatio = BigInt(100) - BigInt(100) * nxmOut / nxmOutAtSpotPrice;

  console.log('nxm out         = ', nxmOut);
  console.log('nxm out at spot = ', nxmOutAtSpotPrice);
  console.log('price impact    = %s%%', priceImpactRatio);

  return priceImpactRatio;
};
