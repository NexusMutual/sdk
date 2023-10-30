import { parseEther } from 'viem';
import { Reserves } from './reserves.type';
import { calculateEthForExactNxm } from './calculateEthForExactNxm';
import { BigNumber } from 'ethers';

describe('calculateEthForExactNxm', () => {
  const reserves: Reserves = {
    nxmA: 142858457219554100789497n,
    nxmB: 328817222320643252285179n,
    ethReserve: 5000000000000000000000n,
    budget: 43835000000000000000000n,
  };

  const cases = [
    ['unit value', '1', 34999922981378727n],
    ['decimal value', '0.1', 3499970248373829n],
    ['large value', '1000000', 35006677919768798199868n], // ! this returns a negative value - why?
    ['small value', '0.000000000000000001', 0n],
    ['zero value', '0', 0n],
    ['unit negative  value', '-1', 0n],
    ['large negative value', '-1000000', 0n],
    ['small negative value', '-0.000000000000000001', 0n],
  ];

  test.each(cases)('calculates nxm out for eth in correctly - %s', (_type, nxmOut, expectedEthIn) => {
    const nxmOutParsed = parseEther(nxmOut.toString());
    const ethInCalculated = calculateEthForExactNxm(nxmOutParsed, reserves);
    expect(ethInCalculated.toString()).toBe(expectedEthIn.toString());
  });

  it('returns 0 nxm out for eth in - null value', () => {
    const nxmOut = null as bigint | null;
    const ethIn = calculateEthForExactNxm(nxmOut as bigint, reserves);
    expect(ethIn.toString()).toBe('0');
  });

  // throw error for invalid nxmOut values
  it('throws error for eth in - undefined value', () => {
    const nxmOut = undefined as bigint | undefined;
    expect(() => calculateEthForExactNxm(nxmOut as bigint, reserves)).toThrow(
      'Cannot mix BigInt and other types, use explicit conversions',
    );
  });

  it('throws error for eth in - string value', () => {
    const nxmOut = '1' as unknown as bigint;
    expect(() => calculateEthForExactNxm(nxmOut, reserves)).toThrow(
      'Cannot mix BigInt and other types, use explicit conversions',
    );
  });

  it('throws error for eth in - object value', () => {
    const nxmOut = {} as unknown as bigint;
    expect(() => calculateEthForExactNxm(nxmOut, reserves)).toThrow(
      'Cannot mix BigInt and other types, use explicit conversions',
    );
  });

  it('throws an error for eth in - BigNumber value', () => {
    const nxmOut = BigNumber.from(1) as unknown as bigint;
    expect(() => calculateEthForExactNxm(nxmOut, reserves)).toThrow(
      'Cannot mix BigInt and other types, use explicit conversions',
    );
  });
});
