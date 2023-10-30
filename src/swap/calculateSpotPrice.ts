import { Reserves } from './reserves.type';

export const calculateSpotPrice = (reserves: Reserves) => {
  const oneEth = BigInt(1e18);
  return {
    spotPriceA: (oneEth * reserves.ethReserve) / reserves.nxmA,
    spotPriceB: (oneEth * reserves.ethReserve) / reserves.nxmB,
  };
};
