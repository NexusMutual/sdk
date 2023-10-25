import { Reserves } from './reserves.type';

// k = state.nxmB * state.eth
// ethNew = state.eth - ethOutput
// nxmBNew = k / ethNew
// nxmIn = nxmBNew - state.nxmB

/**
 * Calculates the amount of nxm needed to flow into the pool to get the exact amount of eth out
 */
export const calculateNxmForExactEth = (ethOut: bigint, reserves: Reserves): bigint => {
  // Calculate the constant product (k) for the market maker model
  const k = reserves.nxmB * reserves.ethReserve;

  // Simulate the swap and calculate the new reserves
  const ethReservesAfter = reserves.ethReserve + ethOut;
  const nxmReservesAfter = k / ethReservesAfter;

  // Calculate the amount of Nxm needed to flow into the pool to get the desired amount of eth
  const nxmIn = nxmReservesAfter - reserves.ethReserve;

  return nxmIn;
};
