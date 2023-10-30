import { parseEther } from 'viem';
import { Reserves } from './reserves.type';
import { calculateNxmForEth } from './calculateNxmForEth';
import { BigNumber } from 'ethers';

describe('calculateNxmForEth', () => {
  const reserves: Reserves = {
    nxmA: 142858457219554100789497n,
    nxmB: 328817222320643252285179n,
    ethReserve: 5000000000000000000000n,
    budget: 43835000000000000000000n,
  };

  const cases = [
    ['unit value', '1', 28565978248261167925n],
    ['decimal value', '0.1', 2857112002151038996n],
    ['large value', '1000000', 142147718626421990835321n],
    ['small value', '0.000000000000000001', 29n],
    ['zero value', '0', 0n],
    ['unit negative  value', '-1', 0n],
    ['large negative value', '-1000000', 0n],
    ['small negative value', '-0.000000000000000001', 0n],
  ];

  test.each(cases)('calculates nxm out for eth in correctly - %s', (_type, ethIn, expectedNxmOut) => {
    const ethInParsed = parseEther(ethIn.toString());
    const nxmOutCalculated = calculateNxmForEth(ethInParsed, reserves);
    expect(nxmOutCalculated.toString()).toBe(expectedNxmOut.toString());
  });

  it('returns 0 nxm out for eth in - null value', () => {
    const ethIn = null as bigint | null;
    const nxmOut = calculateNxmForEth(ethIn as bigint, reserves);
    expect(nxmOut.toString()).toBe('0');
  });

  // throw error for invalid ethIn values
  it('throws error for eth in - undefined value', () => {
    const ethIn = undefined as bigint | undefined;
    expect(() => calculateNxmForEth(ethIn as bigint, reserves)).toThrow(
      'Cannot mix BigInt and other types, use explicit conversions',
    );
  });

  it('throws error for eth in - string value', () => {
    const ethIn = '1' as unknown as bigint;
    expect(() => calculateNxmForEth(ethIn, reserves)).toThrow(
      'Cannot mix BigInt and other types, use explicit conversions',
    );
  });

  it('throws error for eth in - object value', () => {
    const ethIn = {} as unknown as bigint;
    expect(() => calculateNxmForEth(ethIn, reserves)).toThrow(
      'Cannot mix BigInt and other types, use explicit conversions',
    );
  });

  it('throws an error for eth in - BigNumber value', () => {
    const ethIn = BigNumber.from(1) as unknown as bigint;
    expect(() => calculateNxmForEth(ethIn, reserves)).toThrow(
      'Cannot mix BigInt and other types, use explicit conversions',
    );
  });
});
