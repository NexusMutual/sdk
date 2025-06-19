import { parseEther } from 'viem';

import { Reserves } from './reserves.type';
import { Swap } from './Swap';

describe('calculateSpotPrice', () => {
  const swapApi = new Swap();
  const reserves: Reserves = {
    nxmA: parseEther('2'),
    nxmB: parseEther('5'),
    ethReserve: parseEther('10'),
    budget: BigInt('0'),
  };

  it('calculates spot price', () => {
    const { spotPriceA, spotPriceB } = swapApi.calculateSpotPrice(reserves);
    expect(spotPriceA).toBe(parseEther('5'));
    expect(spotPriceB).toBe(parseEther('2'));
  });
});
