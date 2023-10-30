import { parseEther } from 'viem';
import { Reserves } from './reserves.type';
import { calculateNxmForExactEth } from './calculateNxmForExactEth';
import { BigNumber } from 'ethers';

describe('calculateNxmForExactEth', () => {
  const reserves: Reserves = {
    nxmA: 142858457219554100789497n,
    nxmB: 328817222320643252285179n,
    ethReserve: 5000000000000000000000n,
    budget: 43835000000000000000000n,
  };

  const cases = [
    ['unit value', '1', 65776599784085467550n],
    ['decimal value', '0.1', 6576475975932383693n],
    ['large value', '1000000', 65763644464128646947237706n], // ! this returns a negative value - why?
    ['small value', '0.000000000000000001', 65n],
    ['zero value', '0', 0n],
    ['unit negative  value', '-1', 0n],
    ['large negative value', '-1000000', 0n],
    ['small negative value', '-0.000000000000000001', 0n],
  ];

  test.each(cases)('calculates nxm out for eth in correctly - %s', (_type, ethOut, expectedNxmIn) => {
    const ethOutParsed = parseEther(ethOut.toString());
    const nxmInCalculated = calculateNxmForExactEth(ethOutParsed, reserves);
    expect(nxmInCalculated.toString()).toBe(expectedNxmIn.toString());
  });

  it('returns 0 nxm out for eth in - null value', () => {
    const ethOut = null as bigint | null;
    const nxmIn = calculateNxmForExactEth(ethOut as bigint, reserves);
    expect(nxmIn.toString()).toBe('0');
  });

  // throw error for invalid ethOut values
  it('throws error for eth in - undefined value', () => {
    const ethOut = undefined as bigint | undefined;
    expect(() => calculateNxmForExactEth(ethOut as bigint, reserves)).toThrow(
      'Cannot mix BigInt and other types, use explicit conversions',
    );
  });

  it('throws error for eth in - string value', () => {
    const ethOut = '1' as unknown as bigint;
    expect(() => calculateNxmForExactEth(ethOut, reserves)).toThrow(
      'Cannot mix BigInt and other types, use explicit conversions',
    );
  });

  it('throws error for eth in - object value', () => {
    const ethOut = {} as unknown as bigint;
    expect(() => calculateNxmForExactEth(ethOut, reserves)).toThrow(
      'Cannot mix BigInt and other types, use explicit conversions',
    );
  });

  it('throws an error for eth in - BigNumber value', () => {
    const ethOut = BigNumber.from(1) as unknown as bigint;
    expect(() => calculateNxmForExactEth(ethOut, reserves)).toThrow(
      'Cannot mix BigInt and other types, use explicit conversions',
    );
  });
});
