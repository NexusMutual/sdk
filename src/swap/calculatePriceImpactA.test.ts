import { calculatePriceImpactA } from './calculatePriceImpactA';
import { Reserves } from './reserves.type';
import { parseEther } from 'viem';

describe('calculatePriceImpactA', () => {
  const reserves: Reserves = {
    nxmA: BigInt('144258115168288148164359'),
    nxmB: BigInt('328083361976871023072198'),
    ethReserve: BigInt('5000000000000000000000'),
    budget: BigInt('0'),
  };

  it('calculates price impact A', () => {
    const ethIn = parseEther('1');
    const result = calculatePriceImpactA(ethIn, reserves);
    expect(result).toBe(BigInt('200'));
  });
});
