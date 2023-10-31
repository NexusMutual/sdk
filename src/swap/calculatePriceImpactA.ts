import { parseEther } from 'viem';
import { absBigInt } from '../utils/absBigInt';
import { calculateNxmForEth } from './calculateNxmForEth';
import { calculateSpotPrice } from './calculateSpotPrice';
import { Reserves } from './reserves.type';

// Calculate the price impact when buying NXM with ETH
export const calculatePriceImpactA = (ethIn: bigint, reserves: Reserves) => {
  const { spotPriceA } = calculateSpotPrice(reserves);
  const nxmOut = calculateNxmForEth(ethIn, reserves);
  const nxmOutAtSpotPrice = ethIn / spotPriceA * BigInt(1e18);

  // [(nxmOut - nxmOutAtSpot) / nxmOutAtSpot] * 100 = (nxmOut / nxmOutAtSpot - 1) * 100
  const priceImpactRatio = BigInt(100) * nxmOut / nxmOutAtSpotPrice - BigInt(100);

  console.log('spotPriceA', spotPriceA);
  console.log('nxmOut', nxmOut);
  console.log('nxmOutAtSpotPrice', nxmOutAtSpotPrice);
  console.log('priceImpactRatio', priceImpactRatio.toString());

  return priceImpactRatio;
};
