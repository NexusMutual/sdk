import { parseEther } from 'viem';
import { Reserves } from './reserves.type';
import { calculateNxmForEth } from './calculateNxmForEth';

describe('calculateNxmForEth', () => {
  const reserves: Reserves = {
    nxmA: BigInt('144258115168288148164359'),
    nxmB: BigInt('0'),
    ethReserve: BigInt('5000000000000000000000'),
    budget: BigInt('0'),
  };

  it('calculates nxm out for eth in correctly', () => {
    const ethIn = parseEther('1');
    const nxmOut = calculateNxmForEth(ethIn, reserves);
    expect(nxmOut.toString()).toBe('28845853862885052623');
  });
});
