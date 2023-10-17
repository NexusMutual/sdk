import { Reserves } from './reserves.type';

export const ethToNxm = (ethIn: bigint, reserves: Reserves): bigint => {
  // Extracting the current reserves of Nxm and Eth
  const nxmReservesBefore = BigInt(reserves.nxmA);
  const ethReserveBefore = BigInt(reserves.ethReserve);

  // Calculate the constant product (k) for the market maker model
  const k = ethReserveBefore * nxmReservesBefore;

  // Simulate the swap and calculate the new reserves
  const ethReservesAfter = ethReserveBefore + ethIn;
  const nxmReservesAfter = k / ethReservesAfter;

  // Calculate the amount of Nxm that will flow out of the pool
  const nxmOut = nxmReservesBefore - nxmReservesAfter;

  return nxmOut;
};
