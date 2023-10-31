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
    ['small value', '0.000000000000000001', 1n],
    ['large value', '1000000', 3762744729683749758291n],
    ['very large value', '100000000000000', 4999999983559138938029n]
  ];

  test.each(cases)('calculates eth out for nxm in correctly - %s', (_type, nxmIn, expectedEthOut) => {
    const nxmInParsed = parseEther(nxmIn.toString());
    const ethOutCalculated = calculateEthForNxm(nxmInParsed, reserves);
    expect(ethOutCalculated.toString()).toBe(expectedEthOut.toString());
  });


  // throws error for invalid nxmIn values
  const invalidCases: Array<[string, any, string]> = [
    ['zero value', parseEther('0'), 'NXM in value must be greater than 0'],
    ['unit negative  value', parseEther('-1'), 'NXM in value must be greater than 0'],
    ['large negative value', parseEther('-1000000'), 'NXM in value must be greater than 0'],
    ['small negative value', parseEther('-0.000000000000000001'), 'NXM in value must be greater than 0'],
    ['null value', null, 'NXM in value must be greater than 0'],
    ['undefined value', undefined, 'Cannot mix BigInt and other types, use explicit conversions'],
    ['string value', '1', 'Cannot mix BigInt and other types, use explicit conversions'],
    ['object value', {}, 'Cannot mix BigInt and other types, use explicit conversions'],
    ['BigNumber value', BigNumber.from(1), 'Cannot mix BigInt and other types, use explicit conversions'],
  ];

  test.each(invalidCases)(
    'throws error for invalid nxm in values - %s',
    (_type: string, nxmIn: any, expectedError: string) => {
      expect(() => calculateEthForNxm(nxmIn as bigint, reserves)).toThrow(expectedError);
    },
  );
});
