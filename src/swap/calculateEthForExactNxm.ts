import { Reserves } from './reserves.type';

/**
 * Calculates the amount of eth needed to flow into the pool to get the exact amount of nxm out
 */
// suggestion: calculateEthInGivenNxmOut
export const calculateEthForExactNxm = (nxmOut: bigint, reserves: Reserves): bigint => {
  // Calculate the constant product (k) for the market maker model
  const k = reserves.nxmA * reserves.ethReserve;

  // Simulate the swap and calculate the new reserves
  const nxmReservesAfter = reserves.nxmA - nxmOut;
  const ethReservesAfter = k / nxmReservesAfter;

  // Calculate the amount of Nxm needed to flow into the pool to get the desired amount of eth
  const ethIn = ethReservesAfter - reserves.ethReserve;

  return ethIn;
};
