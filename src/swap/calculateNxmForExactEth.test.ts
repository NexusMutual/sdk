import { BigNumber } from 'ethers';
import { parseEther } from 'viem';

import { calculateNxmForExactEth } from './calculateNxmForExactEth';
import { Reserves } from './reserves.type';

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
    ['small value', '0.000000000000000001', 65n],
    ['large value under ethReserve', '4000', 1315268889282573009140716n],
  ];

  test.each(cases)('calculates nxm out for eth in correctly - %s', (_type, ethOut, expectedNxmIn) => {
    const ethOutParsed = parseEther(ethOut.toString());
    const nxmInCalculated = calculateNxmForExactEth(ethOutParsed, reserves);
    expect(nxmInCalculated.toString()).toBe(expectedNxmIn.toString());
  });

  // throws error for invalid ethOut values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invalidCases: Array<[string, any, string]> = [
    ['large = ethReserve', parseEther('5000'), 'ETH out value must be greater than 0 and less than the reserves'],
    [
      'large value over ethReserve',
      parseEther('15000'),
      'ETH out value must be greater than 0 and less than the reserves',
    ],
    [
      'larger value over ethReserve',
      parseEther('100000'),
      'ETH out value must be greater than 0 and less than the reserves',
    ],
    ['zero value', parseEther('0'), 'ETH out value must be greater than 0 and less than the reserves'],
    ['unit negative  value', parseEther('-1'), 'ETH out value must be greater than 0 and less than the reserves'],
    ['large negative value', parseEther('-1000000'), 'ETH out value must be greater than 0 and less than the reserves'],
    [
      'small negative value',
      parseEther('-0.000000000000000001'),
      'ETH out value must be greater than 0 and less than the reserves',
    ],
    ['null value', null, 'ETH out value must be greater than 0 and less than the reserves'],
    ['undefined value', undefined, 'Cannot mix BigInt and other types, use explicit conversions'],
    ['string value', '1', 'Cannot mix BigInt and other types, use explicit conversions'],
    ['object value', {}, 'Cannot mix BigInt and other types, use explicit conversions'],
    ['BigNumber value', BigNumber.from(1), 'Cannot mix BigInt and other types, use explicit conversions'],
  ];

  test.each(invalidCases)(
    'throws error for invalid eth out values - %s',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_type: string, ethOut: any, expectedError: string) => {
      expect(() => calculateNxmForExactEth(ethOut as bigint, reserves)).toThrow(expectedError);
    },
  );
});
