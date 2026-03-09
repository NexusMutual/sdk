import { parseEther } from 'ethers/lib/utils';

import { Reserves } from './reserves.type';
import { Swap } from './Swap';

describe('calculateSpotPrice', () => {
  const swapApi = new Swap();
  const reserves: Reserves = {
    nxmA: parseEther('2').toBigInt(),
    nxmB: parseEther('5').toBigInt(),
    ethReserve: parseEther('10').toBigInt(),
    budget: BigInt('0'),
  };

  it('calculates spot price', () => {
    const { spotPriceA, spotPriceB } = swapApi.calculateSpotPrice(reserves);
    expect(spotPriceA).toBe(parseEther('5').toBigInt());
    expect(spotPriceB).toBe(parseEther('2').toBigInt());
  });
});
