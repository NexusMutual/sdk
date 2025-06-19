import { formatEther, parseEther } from 'viem';

import { Quote } from './index';
import { COMMISSION_DENOMINATOR } from '../constants/cover';

const BUY_COVER_COMMISSION_RATIO = 1500;

describe('calculatePremiumWithCommissionAndSlippage', () => {
  let priceValue = parseEther('0');
  const quoteApi = new Quote();

  const priceWithCommissionFormula = (value: string) =>
    parseFloat(((+value * COMMISSION_DENOMINATOR) / (COMMISSION_DENOMINATOR - BUY_COVER_COMMISSION_RATIO)).toFixed(12));

  const priceWithCommissionAndSlippageFormula = (value: string, slippage = 0) =>
    parseFloat(
      ((priceWithCommissionFormula(value) * (COMMISSION_DENOMINATOR + slippage)) / COMMISSION_DENOMINATOR).toFixed(12),
    );

  beforeEach(() => {
    priceValue = parseEther('0');
  });

  it('should return 0 BigInt value for 0 price value', () => {
    const expectedValue = parseEther('0');

    expect(quoteApi.calculatePremiumWithCommissionAndSlippage(priceValue, BUY_COVER_COMMISSION_RATIO)).toStrictEqual(
      expectedValue,
    );
  });

  it('should return correct BigInt values for 1 value price - integer value', () => {
    const value = '1';
    priceValue = parseEther(value);

    const expectedValue = priceWithCommissionAndSlippageFormula(value);

    const actualValue = quoteApi.calculatePremiumWithCommissionAndSlippage(priceValue, BUY_COVER_COMMISSION_RATIO);
    const actualValueFormatted = formatEther(actualValue);

    expect(parseFloat(actualValueFormatted)).toBeCloseTo(expectedValue, 4);
  });

  it('should return correct BigInt value for 0.1 value price - decimal value < 1', () => {
    const value = '0.1';
    priceValue = parseEther(value);

    const expectedValue = priceWithCommissionAndSlippageFormula(value);

    const actualValue = quoteApi.calculatePremiumWithCommissionAndSlippage(priceValue, BUY_COVER_COMMISSION_RATIO);
    const actualValueFormatted = formatEther(actualValue);

    expect(parseFloat(actualValueFormatted)).toBeCloseTo(expectedValue, 4);
  });

  it('should return correct BigInt value for 1.23456789 value price - decimal value > 1', () => {
    const value = '1.23456789';
    priceValue = parseEther(value);

    const expectedValue = priceWithCommissionAndSlippageFormula(value);

    const actualValue = quoteApi.calculatePremiumWithCommissionAndSlippage(priceValue, BUY_COVER_COMMISSION_RATIO);
    const actualValueFormatted = formatEther(actualValue);

    expect(parseFloat(actualValueFormatted)).toBeCloseTo(expectedValue, 4);
  });

  it('should return correct BigInt values for 1000 value price - integer value', () => {
    const value = '1000';
    priceValue = parseEther(value);

    const expectedValue = priceWithCommissionAndSlippageFormula(value);

    const actualValue = quoteApi.calculatePremiumWithCommissionAndSlippage(priceValue, BUY_COVER_COMMISSION_RATIO);
    const actualValueFormatted = formatEther(actualValue);

    expect(parseFloat(actualValueFormatted)).toBeCloseTo(expectedValue, 4);
  });

  it('should return correct BigInt value for 0.1 value price as BigInt-like object - decimal value < 1', () => {
    const value = '0.1';
    priceValue = parseEther(value);

    const expectedValue = priceWithCommissionAndSlippageFormula(value);

    const actualValue = quoteApi.calculatePremiumWithCommissionAndSlippage(priceValue, BUY_COVER_COMMISSION_RATIO);
    const actualValueFormatted = formatEther(actualValue);

    expect(parseFloat(actualValueFormatted)).toBeCloseTo(expectedValue, 4);
  });

  it('should return correct BigInt value for 1.23456789 value price as BigInt-like object - decimal value > 1', () => {
    const value = '1.23456789';
    priceValue = parseEther(value);

    const expectedValue = priceWithCommissionAndSlippageFormula(value);

    const actualValue = quoteApi.calculatePremiumWithCommissionAndSlippage(priceValue, BUY_COVER_COMMISSION_RATIO);
    const actualValueFormatted = formatEther(actualValue);

    expect(parseFloat(actualValueFormatted)).toBeCloseTo(expectedValue, 4);
  });

  it('should return correct BigInt values for 1 value price and 1% slippage', () => {
    const value = '1';
    priceValue = parseEther(value);
    const slippageValue = 100;

    const expectedValue = priceWithCommissionAndSlippageFormula(value, slippageValue);

    const actualValue = quoteApi.calculatePremiumWithCommissionAndSlippage(
      priceValue,
      BUY_COVER_COMMISSION_RATIO,
      slippageValue,
    );
    const actualValueFormatted = formatEther(actualValue);

    expect(parseFloat(actualValueFormatted)).toBeCloseTo(expectedValue, 4);
  });

  it('should return correct BigInt values for 1 value price and 0.5% slippage', () => {
    const value = '1';
    priceValue = parseEther(value);
    const slippageValue = 50;

    const expectedValue = priceWithCommissionAndSlippageFormula(value, slippageValue);

    const actualValue = quoteApi.calculatePremiumWithCommissionAndSlippage(
      priceValue,
      BUY_COVER_COMMISSION_RATIO,
      slippageValue,
    );
    const actualValueFormatted = formatEther(actualValue);

    expect(parseFloat(actualValueFormatted)).toBeCloseTo(expectedValue, 4);
  });
});
