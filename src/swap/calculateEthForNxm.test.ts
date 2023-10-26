import { parseEther } from 'viem';
import { Reserves } from './reserves.type';
import { calculateEthForNxm } from './calculateEthForNxm';

describe('calculateEthForNxm', () => {
  const reserves: Reserves = {
    nxmA: BigInt('0'),
    nxmB: BigInt('328083361976871023072198'),
    ethReserve: BigInt('5000000000000000000000'),
    budget: BigInt('0'),
  };

  it('calculates eth out for nxm in correctly', () => {
    const nxmIn = parseEther('1');
    const ethOut = calculateEthForNxm(nxmIn, reserves);
    expect(ethOut.toString()).toBe('15239982697963780');
  });
});
