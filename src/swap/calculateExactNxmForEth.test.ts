import { parseEther } from 'viem';
import { Reserves } from './reserves.type';
import { calculateExactNxmForEth } from './calculateExactNxmForEth';
import { BigNumber } from 'ethers';

describe('calculateExactNxmForEth', () => {
  const reserves: Reserves = {
    nxmA: 142858457219554100789497n,
    nxmB: 328817222320643252285179n,
    ethReserve: 5000000000000000000000n,
    budget: 43835000000000000000000n,
  };

  const cases = [
    ['unit value', '1', 28565978248261167925n],
    ['decimal value', '0.1', 2857112002151038996n],
    ['small value', '0.000000000000000001', 29n],
    ['large value', '1000000', 142147718626421990835321n],
    ['very large value', '100000000000000', 142858457212411177928877n] 
   ];

  test.each(cases)('calculates nxm out for eth in correctly - %s', (_type, ethIn, expectedNxmOut) => {
    const ethInParsed = parseEther(ethIn.toString());
    const nxmOutCalculated = calculateExactNxmForEth(ethInParsed, reserves);
    expect(nxmOutCalculated.toString()).toBe(expectedNxmOut.toString());
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
    'throws error for invalid nxm in values - %s',
    (_type: string, ethIn: any, expectedError: string) => {
      expect(() => calculateExactNxmForEth(ethIn as bigint, reserves)).toThrow(expectedError);
    },
  );
});
