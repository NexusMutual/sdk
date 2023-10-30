import { absBigInt } from './absBigInt';

describe('absBigInt', () => {
  it('returns the absolute value of a positive bigint', () => {
    const value = BigInt(10);
    const result = absBigInt(value);
    expect(result).toBe(BigInt(10));
  });

  it('returns the absolute value of a negative bigint', () => {
    const value = BigInt(-10);
    const result = absBigInt(value);
    expect(result).toBe(BigInt(10));
  });
});
