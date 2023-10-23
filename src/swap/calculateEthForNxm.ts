import { Reserves } from './reserves.type';

export const calculateEthForNxm = (nxmIn: bigint, reserves: Reserves): bigint => {
  // Extracting the current reserves of Nxm and Eth
  const nxmReservesBefore = BigInt(reserves.nxmB);
  const ethReserveBefore = BigInt(reserves.ethReserve);

  // Calculate the constant product (k) for the market maker model
  const k = ethReserveBefore * nxmReservesBefore;

  // Simulate the swap and calculate the new reserves
  const nxmReservesAfter = nxmReservesBefore + nxmIn;
  const ethReservesAfter = k / nxmReservesAfter;

  // Calculate the amount of Eth that will flow out of the pool
  const ethOut = ethReserveBefore - ethReservesAfter;

  return ethOut;
};
