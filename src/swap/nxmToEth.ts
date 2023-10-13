import { Reserves } from './reserves.type';

export const nxmToEth = (nxmAmount: bigint | string, reserves: Reserves): bigint => {
  // Extracting the current reserves of Nxm and Eth
  const nxmReservesBefore = BigInt(reserves.nxmB);
  const ethReserveBefore = BigInt(reserves.ethReserve);

  // Calculate the constant product (k) for the market maker model
  const k = ethReserveBefore * nxmReservesBefore;

  // Amount of Nxm that will flow into the pool
  const nxmIn = BigInt(nxmAmount);

  // Simulate the swap and calculate the new reserves
  const nxmReservesAfter = nxmReservesBefore + nxmIn;
  const ethReservesAfter = k / nxmReservesAfter;

  // Calculate the amount of Eth that will flow out of the pool
  const ethOut = ethReserveBefore - ethReservesAfter;

  return ethOut;
};
