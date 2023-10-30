import { parseEther } from 'viem';
import { Reserves } from './reserves.type';
import { calculateEthForNxm } from './calculateEthForNxm';
import { BigNumber } from 'ethers';

describe('calculateEthForNxm', () => {
  const reserves: Reserves = {
    nxmA: 142858457219554100789497n,
    nxmB: 328817222320643252285179n,
    ethReserve: 5000000000000000000000n,
    budget: 43835000000000000000000n,
  };

  const cases = [
    ['unit value', '1', 15205969926825736n],
    ['decimal value', '0.1', 1520601154681351n],
    ['large value', '1000000', 3762744729683749758291n],
    ['small value', '0.000000000000000001', 1n],
    ['zero value', '0', 0n],
    ['unit negative  value', '-1', 0n],
    ['large negative value', '-1000000', 0n],
    ['small negative value', '-0.000000000000000001', 0n],
  ];

  test.each(cases)('calculates nxm out for eth in correctly - %s', (_type, nxmIn, expectedEthOut) => {
    const nxmInParsed = parseEther(nxmIn.toString());
    const ethOutCalculated = calculateEthForNxm(nxmInParsed, reserves);
    expect(ethOutCalculated.toString()).toBe(expectedEthOut.toString());
  });

  it('returns 0 nxm out for eth in - null value', () => {
    const nxmIn = null as bigint | null;
    const ethOut = calculateEthForNxm(nxmIn as bigint, reserves);
    expect(ethOut.toString()).toBe('0');
  });

  // throw error for invalid nxmIn values
  it('throws error for eth in - undefined value', () => {
    const nxmIn = undefined as bigint | undefined;
    expect(() => calculateEthForNxm(nxmIn as bigint, reserves)).toThrow(
      'Cannot mix BigInt and other types, use explicit conversions',
    );
  });

  it('throws error for eth in - string value', () => {
    const nxmIn = '1' as unknown as bigint;
    expect(() => calculateEthForNxm(nxmIn, reserves)).toThrow(
      'Cannot mix BigInt and other types, use explicit conversions',
    );
  });

  it('throws error for eth in - object value', () => {
    const nxmIn = {} as unknown as bigint;
    expect(() => calculateEthForNxm(nxmIn, reserves)).toThrow(
      'Cannot mix BigInt and other types, use explicit conversions',
    );
  });

  it('throws an error for eth in - BigNumber value', () => {
    const nxmIn = BigNumber.from(1) as unknown as bigint;
    expect(() => calculateEthForNxm(nxmIn, reserves)).toThrow(
      'Cannot mix BigInt and other types, use explicit conversions',
    );
  });
});
