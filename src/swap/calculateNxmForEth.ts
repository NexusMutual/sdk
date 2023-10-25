import { Reserves } from './reserves.type';

export const calculateNxmForEth = (ethIn: bigint, reserves: Reserves): bigint => {
  // Calculate the constant product (k) for the market maker model
  const k = reserves.nxmA * reserves.ethReserve;

  // Simulate the swap and calculate the new reserves
  const ethReservesAfter = reserves.ethReserve + ethIn;
  const nxmReservesAfter = k / ethReservesAfter;

  // Calculate the amount of Nxm that will flow out of the pool
  const nxmOut = reserves.nxmA - nxmReservesAfter;

  return nxmOut;
};
