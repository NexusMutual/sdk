import mockAxios from 'jest-mock-axios';
import { parseEther } from 'viem';

import { calculatePremiumWithCommissionAndSlippage } from '../buyCover';
import {
  CoverAsset,
  CoverId,
  DEFAULT_COMMISSION_RATIO,
  MAXIMUM_COVER_PERIOD,
  MINIMUM_COVER_PERIOD,
  NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  SLIPPAGE_DENOMINATOR,
  TARGET_PRICE_DENOMINATOR,
} from '../constants/buyCover';
import { Address, CoverRouterQuoteResponse, PoolCapacity } from '../types';
import { sumPoolCapacities, getQuoteAndBuyCoverInputs } from './getQuoteAndBuyCoverInputs';

describe('getQuoteAndBuyCoverInputs', () => {
  let buyerAddress: Address;

  beforeAll(() => {
    jest.mock('axios');
    process.env.COVER_ROUTER_URL = 'http://localhost:5001';
    buyerAddress = '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5';
  });

  it('returns an error if COVER_ROUTER_URL env var is missing', async () => {
    // Simulate missing COVER_ROUTER_URL env var by temporarily clearing it
    const originalCoverRouterUrl = process.env.COVER_ROUTER_URL;
    delete process.env.COVER_ROUTER_URL;

    const { error } = await getQuoteAndBuyCoverInputs(1, '100', 30, CoverAsset.ETH, buyerAddress);
    await expect(error?.message).toBe('Missing COVER_ROUTER_URL env var');

    // Restore COVER_ROUTER_URL after test
    process.env.COVER_ROUTER_URL = originalCoverRouterUrl;
  });

  const invalidProductIds = [-1, 'a', true, {}, [], null, undefined];
  it.each(invalidProductIds)('returns an error if productId is not a positive integer (%s)', async invalidProductId => {
    const { error } = await getQuoteAndBuyCoverInputs(
      invalidProductId as number,
      '100',
      30,
      CoverAsset.ETH,
      buyerAddress,
    );
    expect(error?.message).toBe('Invalid productId: must be a positive integer');
  });

  const invalidCoverAmounts = [-1, 1, '100000.1', '-100', 'abc', true, {}, [], null, undefined];
  it.each(invalidCoverAmounts)(
    'returns an error if coverAmount is not a positive integer string (%s)',
    async invalidCoverAmount => {
      const { error } = await getQuoteAndBuyCoverInputs(
        1,
        invalidCoverAmount as string,
        30,
        CoverAsset.ETH,
        buyerAddress,
      );
      expect(error?.message).toBe('Invalid coverAmount: must be a positive integer string');
    },
  );

  const invalidCoverPeriods = [-1, 27, 366, '30', 'abc', true, {}, [], null, undefined];
  it.each(invalidCoverPeriods)('returns an error if coverPeriod is invalid (%s)', async invalidCoverPeriod => {
    const { error } = await getQuoteAndBuyCoverInputs(
      1,
      '100',
      invalidCoverPeriod as any,
      CoverAsset.ETH,
      buyerAddress,
    );
    expect(error?.message).toBe(
      `Invalid coverPeriod: must be between ${MINIMUM_COVER_PERIOD} and ${MAXIMUM_COVER_PERIOD} days`,
    );
  });

  const invalidCoverAssets = ['BTC', '', true, {}, [], null, undefined];
  it.each(invalidCoverAssets)('returns an error if coverAsset is invalid (%s)', async invalidCoverAsset => {
    const { error } = await getQuoteAndBuyCoverInputs(1, '100', 30, invalidCoverAsset as any, buyerAddress);
    const coverAssetsString = Object.keys(CoverAsset)
      .filter(k => isNaN(+k))
      .map(k => `CoverAsset.${k}`)
      .join(', ');
    expect(error?.message).toBe(`Invalid coverAsset: must be one of ${coverAssetsString}`);
  });

  const invalidPaymentAssets = ['BTC', '', true, {}, [], null];
  it.each(invalidPaymentAssets)('returns an error if paymentAsset is invalid (%s)', async invalidPaymentAsset => {
    const { error } = await getQuoteAndBuyCoverInputs(
      1,
      '100',
      30,
      CoverAsset.ETH,
      buyerAddress,
      invalidPaymentAsset as any,
    );
    const coverAssetsString = Object.keys(CoverAsset)
      .filter(k => isNaN(+k))
      .map(k => `CoverAsset.${k}`)
      .join(', ');
    expect(error?.message).toBe(`Invalid paymentAsset: must be one of ${coverAssetsString}`);
  });

  const invalidAddresses = ['0x123', '', true, {}, [], null, undefined];
  it.each(invalidAddresses)(
    'returns an error if coverBuyerAddress is not a valid Ethereum address (%s)',
    async invalidAddress => {
      const { error } = await getQuoteAndBuyCoverInputs(1, '100', 30, CoverAsset.ETH, invalidAddress as any);
      expect(error?.message).toBe('Invalid coverBuyerAddress: must be a valid Ethereum address');
    },
  );

  const invalidSlippages = [-0.1, 100_01, '0.1', '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5', true, {}, [], null];
  it.each(invalidSlippages)(
    `returns an error if slippage is not a number between 0 and ${SLIPPAGE_DENOMINATOR} (%s)`,
    async invalidSlippage => {
      const { error } = await getQuoteAndBuyCoverInputs(
        1,
        '100',
        30,
        CoverAsset.ETH,
        buyerAddress,
        invalidSlippage as number,
      );
      expect(error?.message).toBe(`Invalid slippage: must be a number between 0 and ${SLIPPAGE_DENOMINATOR}`);
    },
  );

  const invalidIpfsData = [123, true, {}, [], null];
  it.each(invalidIpfsData)(
    'returns an error if ipfsData is not a valid IPFS base32 hash value (%s)',
    async invalidData => {
      const { error } = await getQuoteAndBuyCoverInputs(
        1,
        '100',
        30,
        CoverAsset.ETH,
        buyerAddress,
        0.1,
        invalidData as string,
      );
      expect(error?.message).toBe('Invalid ipfsCid: must be a valid IPFS CID');
    },
  );

  it.only('returns an object with displayInfo and buyCoverInput parameters', async () => {
    const coverRouterQuoteResponse: CoverRouterQuoteResponse = {
      quote: {
        totalCoverAmountInAsset: parseEther('1000').toString(),
        annualPrice: '287',
        premiumInNXM: parseEther('10').toString(),
        premiumInAsset: parseEther('5').toString(),
        poolAllocationRequests: [
          {
            poolId: '147',
            coverAmountInAsset: parseEther('500').toString(),
            skip: false,
          },
        ],
      },
      capacities: [{ poolId: '147', capacity: [{ assetId: '1', amount: parseEther('1000').toString() }] }],
    };
    mockAxios.get.mockResolvedValue({ data: coverRouterQuoteResponse });

    const coverAmount = parseEther('100').toString();
    const { result, error } = await getQuoteAndBuyCoverInputs(
      1, // productId
      coverAmount,
      28, // coverPeriod
      CoverAsset.ETH, // coverAsset
      buyerAddress, // coverBuyerAddress
      100, // slippage
      'QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY', // ipfsCid
    );

    const { premiumInAsset, annualPrice } = coverRouterQuoteResponse.quote;
    const expectedMaxPremiumInAsset = calculatePremiumWithCommissionAndSlippage(
      BigInt(premiumInAsset),
      DEFAULT_COMMISSION_RATIO,
      100,
    );
    const expectedYearlyCostPerc = calculatePremiumWithCommissionAndSlippage(
      BigInt(annualPrice),
      DEFAULT_COMMISSION_RATIO,
      100,
    );

    expect(error).toBeUndefined();
    expect(result?.displayInfo.premiumInAsset).toBe(expectedMaxPremiumInAsset.toString());
    expect(result?.displayInfo.coverAmount).toBe(coverAmount);
    expect(result?.displayInfo.yearlyCostPerc).toBe(Number(expectedYearlyCostPerc) / TARGET_PRICE_DENOMINATOR);
    expect(result?.displayInfo.maxCapacity).toBe(parseEther('1000').toString());
    expect(result?.buyCoverInput.buyCoverParams.coverId).toBe(CoverId.BUY);
    expect(result?.buyCoverInput.buyCoverParams.owner).toBe(buyerAddress);
    expect(result?.buyCoverInput.buyCoverParams.productId).toBe(1);
    expect(result?.buyCoverInput.buyCoverParams.coverAsset).toBe(CoverAsset.ETH);
    expect(result?.buyCoverInput.buyCoverParams.amount).toBe(coverAmount);
    expect(result?.buyCoverInput.buyCoverParams.period).toBe(28 * 60 * 60 * 24);
    expect(result?.buyCoverInput.buyCoverParams.maxPremiumInAsset).toBe(expectedMaxPremiumInAsset.toString());
    expect(result?.buyCoverInput.buyCoverParams.paymentAsset).toBe(CoverAsset.ETH);
    expect(result?.buyCoverInput.buyCoverParams.commissionRatio).toBe(DEFAULT_COMMISSION_RATIO);
    expect(result?.buyCoverInput.buyCoverParams.commissionDestination).toBe(NEXUS_MUTUAL_DAO_TREASURY_ADDRESS);
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe('QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY');
    expect(mockAxios.get).toHaveBeenCalledTimes(1);

    mockAxios.reset();
  });
});

describe('sumPoolCapacities', () => {
  it('should return the sum of all pool capacities as a string', () => {
    const capacities: PoolCapacity[] = [
      {
        poolId: '147',
        capacity: [
          { assetId: '1', amount: '100' },
          { assetId: '1', amount: '200' },
        ],
      },
      {
        poolId: '148',
        capacity: [
          { assetId: '1', amount: '300' },
          { assetId: '1', amount: '400' },
        ],
      },
    ];
    expect(sumPoolCapacities(capacities)).toBe('1000');
  });

  it('should return "0" for empty input', () => {
    const capacities: PoolCapacity[] = [];
    expect(sumPoolCapacities(capacities)).toBe('0');
  });

  it('handles large numbers correctly', () => {
    const capacities: PoolCapacity[] = [
      {
        poolId: '147',
        capacity: [{ assetId: '1', amount: '15369007199254740991' }],
      },
      {
        poolId: '148',
        capacity: [{ assetId: '1', amount: '1169007199254740991' }],
      },
    ];
    expect(sumPoolCapacities(capacities)).toBe('16538014398509481982');
  });
});
