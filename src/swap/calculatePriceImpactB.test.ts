import { calculatePriceImpactB } from './calculatePriceImpactB';
import { Reserves } from './reserves.type';
import { parseEther } from 'viem';

describe('calculatePriceImpactB', () => {
  const reserves: Reserves = {
    nxmA: BigInt('144258115168288148164359'),
    nxmB: BigInt('328083361976871023072198'),
    ethReserve: BigInt('5000000000000000000000'),
    budget: BigInt('0'),
  };

  it('calculates price impact B', () => {
    const nxmIn = parseEther('1');
    const result = calculatePriceImpactB(nxmIn, reserves);
    expect(result).toBe(parseEther('100'));
  });
});
