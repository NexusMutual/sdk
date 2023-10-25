import { Reserves } from './reserves.type';

// k = state.nxmB * state.eth
// nxmBNew = state.nxmB + nxmInput
// ethNew = k / nxmBNewethNew
// ethOut = state.eth - ethNew

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
