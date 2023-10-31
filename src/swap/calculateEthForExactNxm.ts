import { Reserves } from './reserves.type';

/**
 * Calculates the amount of eth needed to flow into the pool to get the exact amount of nxm out
 */
// suggestion: calculateEthInGivenNxmOut
export const calculateEthForExactNxm = (nxmOut: bigint, reserves: Reserves): bigint => {

  if(nxmOut <= 0n) throw new Error('NXM out value must be greater than 0');

  // Calculate the constant product (k) for the market maker model
  const k = reserves.nxmA * reserves.ethReserve;

  // Simulate the swap and calculate the new reserves
  const nxmReservesAfter = reserves.nxmA - nxmOut;
  const ethReservesAfter = k / nxmReservesAfter;

  // Calculate the amount of Nxm needed to flow into the pool to get the desired amount of eth
  const ethIn = ethReservesAfter - reserves.ethReserve;

  if(ethIn < 0n) throw new Error('Cannot swap this amount');

  return ethIn;
};
