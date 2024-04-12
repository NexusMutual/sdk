import { parseEther } from 'viem';

import { calculateSpotPrice } from './calculateSpotPrice';
import { Reserves } from './reserves.type';

describe('calculateSpotPrice', () => {
  const reserves: Reserves = {
    nxmA: parseEther('2'),
    nxmB: parseEther('5'),
    ethReserve: parseEther('10'),
    budget: BigInt('0'),
  };

  it('calculates spot price', () => {
    const { spotPriceA, spotPriceB } = calculateSpotPrice(reserves);
    expect(spotPriceA).toBe(parseEther('5'));
    expect(spotPriceB).toBe(parseEther('2'));
  });
});
