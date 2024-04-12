import { Reserves } from './reserves.type';

/**
 * Calculates the amount of nxm needed to flow into the pool to get the exact amount of eth out
 */
// suggestion: calculateNxmInGivenEthOut
export const calculateNxmForExactEth = (ethOut: bigint, reserves: Reserves): bigint => {
  if (ethOut <= 0n || ethOut >= reserves.ethReserve) {
    throw new Error('ETH out value must be greater than 0 and less than the reserves');
  }

  // Calculate the constant product (k) for the market maker model
  const k = reserves.nxmB * reserves.ethReserve;

  // Simulate the swap and calculate the new reserves
  const ethReservesAfter = reserves.ethReserve - ethOut;
  const nxmReservesAfter = k / ethReservesAfter;

  // Calculate the amount of Nxm needed to flow into the pool to get the desired amount of eth
  const nxmIn = nxmReservesAfter - reserves.nxmB;

  return nxmIn;
};
