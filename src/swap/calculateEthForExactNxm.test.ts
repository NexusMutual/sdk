import { BigNumber } from 'ethers';
import { parseEther } from 'viem';

import { calculateEthForExactNxm } from './calculateEthForExactNxm';
import { Reserves } from './reserves.type';

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
    ['small value', '0.000000000000000001', 0n],
    ['large value under nxmA reserve', '140000', 244887345247446128967433n],
  ];

  test.each(cases)('calculates nxm out for eth in correctly - %s', (_type, nxmOut, expectedEthIn) => {
    const nxmOutParsed = parseEther(nxmOut.toString());
    const ethInCalculated = calculateEthForExactNxm(nxmOutParsed, reserves);
    expect(ethInCalculated.toString()).toBe(expectedEthIn.toString());
  });

  // throws error for invalid nxmOut values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invalidCases: Array<[string, any, string]> = [
    [
      'large value = nxmA reserve',
      parseEther('142858.457219554100789497'),
      'NXM out value must be greater than 0 and less than the reserves',
    ],
    [
      'large value over nxmA reserve',
      parseEther('150000'),
      'NXM out value must be greater than 0 and less than the reserves',
    ],
    [
      'larger value over nxmA reserve',
      parseEther('1000000'),
      'NXM out value must be greater than 0 and less than the reserves',
    ],
    ['zero value', parseEther('0'), 'NXM out value must be greater than 0 and less than the reserves'],
    ['unit negative  value', parseEther('-1'), 'NXM out value must be greater than 0 and less than the reserves'],
    ['large negative value', parseEther('-1000000'), 'NXM out value must be greater than 0 and less than the reserves'],
    [
      'small negative value',
      parseEther('-0.000000000000000001'),
      'NXM out value must be greater than 0 and less than the reserves',
    ],
    ['null value', null, 'NXM out value must be greater than 0 and less than the reserves'],
    ['undefined value', undefined, 'Cannot mix BigInt and other types, use explicit conversions'],
    ['string value', '1', 'Cannot mix BigInt and other types, use explicit conversions'],
    ['object value', {}, 'Cannot mix BigInt and other types, use explicit conversions'],
    ['BigNumber value', BigNumber.from(1), 'Cannot mix BigInt and other types, use explicit conversions'],
  ];

  test.each(invalidCases)(
    'throws error for invalid nxm out values - %s',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_type: string, nxmOut: any, expectedError: string) => {
      expect(() => calculateEthForExactNxm(nxmOut as bigint, reserves)).toThrow(expectedError);
    },
  );
});
