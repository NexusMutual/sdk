import { Reserves } from './reserves.type';

/**
 * Calculates the amount of nxm needed to flow into the pool to get the exact amount of eth out
 */
// suggestion: calculateNxmInGivenEthOut
export const calculateNxmForExactEth = (ethOut: bigint, reserves: Reserves): bigint => {

  if(ethOut <= 0n) throw new Error('ETH out value must be greater than 0');

  // Calculate the constant product (k) for the market maker model
  const k = reserves.nxmB * reserves.ethReserve;

  // Simulate the swap and calculate the new reserves
  const ethReservesAfter = reserves.ethReserve - ethOut;
  const nxmReservesAfter = k / ethReservesAfter;

  // Calculate the amount of Nxm needed to flow into the pool to get the desired amount of eth
  const nxmIn = nxmReservesAfter - reserves.nxmB;

  if(nxmIn < 0n) throw new Error('Cannot swap this amount');

  return nxmIn;
};
