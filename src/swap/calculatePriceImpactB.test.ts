import { BigNumber } from 'ethers';
import { parseEther } from 'viem';

import { calculatePriceImpactB } from './calculatePriceImpactB';
import { Reserves } from './reserves.type';

describe('calculatePriceImpactB', () => {
  const reserves: Reserves = {
    nxmA: BigInt('144258115168288148164359'),
    nxmB: BigInt('328083361976871023072198'),
    ethReserve: BigInt('5000000000000000000000'),
    budget: BigInt('0'),
  };

  const cases = [
    ['unit value', '1', 4n],
    ['decimal value', '0.1', 1n],
    ['large value', '1000000', 752965n],
    ['very large value', '100000000000000', 1000000n],
    ['small value = 1e-16', '0.0000000000000001', -1000000n], // negative value
  ];

  test.each(cases)('calculates price impact B - %s', (_type, nxmIn, expectedPriceImpact) => {
    const nxmInParsed = parseEther(nxmIn.toString());
    const priceImpact = calculatePriceImpactB(nxmInParsed, reserves);
    expect(priceImpact.toString()).toBe(expectedPriceImpact.toString());
  });

  // throws error for invalid nxmIn values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invalidCases: Array<[string, any, string]> = [
    ['small value = 1e-17', parseEther('0.00000000000000001'), 'Division by zero'],
    ['small value = 1e-18', parseEther('0.000000000000000001'), 'Division by zero'],
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_type: string, nxmIn: any, expectedError: string) => {
      expect(() => calculatePriceImpactB(nxmIn as bigint, reserves)).toThrow(expectedError);
    },
  );
});
