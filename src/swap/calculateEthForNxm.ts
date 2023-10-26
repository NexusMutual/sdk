import { Reserves } from './reserves.type';

/**
 * Calculates the amount of eth flowing out of the pool for the given amount of nxm flowing in
 */
// suggestion: calculateEthOutGivenNxmIn
export const calculateEthForNxm = (nxmIn: bigint, reserves: Reserves): bigint => {
  // Calculate the constant product (k) for the market maker model
  const k = reserves.nxmB * reserves.ethReserve;

  // Simulate the swap and calculate the new reserves
  const nxmReservesAfter = reserves.nxmB + nxmIn;
  const ethReservesAfter = k / nxmReservesAfter;

  // Calculate the amount of Eth that will flow out of the pool
  const ethOut = reserves.ethReserve - ethReservesAfter;

  return ethOut;
};
