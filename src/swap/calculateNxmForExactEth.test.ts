import { parseEther } from 'viem';
import { Reserves } from './reserves.type';
import { calculateNxmForExactEth } from './calculateNxmForExactEth';

describe('calculateNxmForExactEth', () => {
  const reserves: Reserves = {
    nxmA: BigInt('0'),
    nxmB: BigInt('328083361976871023072198'),
    ethReserve: BigInt('5000000000000000000000'),
    budget: BigInt('43835000000000000000000'),
  };

  it('calculates eth out for nxm in correctly', () => {
    const ethIn = BigInt('15239982697963780');
    const nxmOut = calculateNxmForExactEth(ethIn, reserves);
    expect(nxmOut).toBe(BigInt('1000000000000000050'));
  });
});
