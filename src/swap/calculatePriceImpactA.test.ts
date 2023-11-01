import { BigNumber } from 'ethers';
import { calculatePriceImpactA } from './calculatePriceImpactA';
import { Reserves } from './reserves.type';
import { parseEther } from 'viem';

describe('calculatePriceImpactB', () => {
  const reserves: Reserves = {
    nxmA: BigInt('144258115168288148164359'),
    nxmB: BigInt('328083361976871023072198'),
    ethReserve: BigInt('5000000000000000000000'),
    budget: BigInt('0'),
  };

  const cases = [
    ['unit value', '1', 200n],
    ['decimal value', '0.1', 20n],
    ['small value = 1e-18', '0.000000000000000001', -35714n], // negative value
    ['large value', '1000000', 995025n],
    ['very large value', '100000000000000', 1000000n],
  ];

  test.each(cases)('calculates price impact A - %s', (_type, ethIn, expectedPriceImpact) => {
    const ethInParsed = parseEther(ethIn.toString());
    const priceImpact = calculatePriceImpactA(ethInParsed, reserves);
    expect(priceImpact.toString()).toBe(expectedPriceImpact.toString());
  });

  // throws error for invalid nxmIn values
  const invalidCases: Array<[string, any, string]> = [
    ['zero value', parseEther('0'), 'ETH in value must be greater than 0'],
    ['unit negative  value', parseEther('-1'), 'ETH in value must be greater than 0'],
    ['large negative value', parseEther('-1000000'), 'ETH in value must be greater than 0'],
    ['small negative value', parseEther('-0.000000000000000001'), 'ETH in value must be greater than 0'],
    ['null value', null, 'ETH in value must be greater than 0'],
    ['undefined value', undefined, 'Cannot mix BigInt and other types, use explicit conversions'],
    ['string value', '1', 'Cannot mix BigInt and other types, use explicit conversions'],
    ['object value', {}, 'Cannot mix BigInt and other types, use explicit conversions'],
    ['BigNumber value', BigNumber.from(1), 'Cannot mix BigInt and other types, use explicit conversions'],
  ];

  test.each(invalidCases)(
    'throws error for invalid eth in values - %s',
    (_type: string, ethIn: any, expectedError: string) => {
      expect(() => calculatePriceImpactA(ethIn as bigint, reserves)).toThrow(expectedError);
    },
  );
});
