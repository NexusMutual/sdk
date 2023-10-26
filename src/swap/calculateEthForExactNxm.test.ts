import { parseEther } from 'viem';
import { Reserves } from './reserves.type';
import { calculateEthForExactNxm } from './calculateEthForExactNxm';

describe('calculateEthForExactNxm', () => {
  const reserves: Reserves = {
    nxmA: BigInt('144258115168288148164359'),
    nxmB: BigInt('0'),
    ethReserve: BigInt('5000000000000000000000'),
    budget: BigInt('0'),
  };

  it('calculates eth in for nxm out', () => {
    const nxmOut = BigInt('28845853862885052623');
    const ethIn = calculateEthForExactNxm(nxmOut, reserves);
    expect(ethIn).toBe(parseEther('1'));
  });
});
