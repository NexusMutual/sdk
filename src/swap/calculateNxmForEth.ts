import { Reserves } from './reserves.type';

/**
 * Calculates the amount of nxm flowing out of the pool for the given amount of eth flowing in
 */
// suggestion: calculateNxmOutGivenEthIn
export const calculateNxmForEth = (ethIn: bigint, reserves: Reserves): bigint => {
 
  if(ethIn <= 0n) throw new Error('ETH in value must be greater than 0');
 
  // Calculate the constant product (k) for the market maker model
  const k = reserves.nxmA * reserves.ethReserve;

  // Simulate the swap and calculate the new reserves
  const ethReservesAfter = reserves.ethReserve + ethIn;
  const nxmReservesAfter = k / ethReservesAfter;

  // Calculate the amount of Nxm that will flow out of the pool
  const nxmOut = reserves.nxmA - nxmReservesAfter;

  if(nxmOut < 0n) throw new Error('Cannot swap this amount');

  return nxmOut;
};
