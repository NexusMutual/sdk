import { CoverAsset, MINIMUM_COVER_PERIOD } from '../constants/buyCover';
import { getMaxCapacity, getQuoteAndBuyCoverInputs } from './getQuoteAndBuyCoverInputs';
import { Address, PoolCapacity } from '../types';

describe('getQuoteAndBuyCoverInputs', () => {
  let buyerAddress: Address;
  beforeAll(() => {
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

  const invalidProductIds = [-1, 'a', true, {}, null, undefined];
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

  const invalidCoverAmounts = [-1, '-100', '1.123', 'abc', true, {}, null, undefined];
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

  const invalidCoverPeriods = [-1, 27, '30', 'abc', true, {}, null, undefined];
  it.each(invalidCoverPeriods)(
    'returns an error if coverPeriod is not a positive integer (%s)',
    async invalidCoverPeriod => {
      const { error } = await getQuoteAndBuyCoverInputs(
        1,
        '100',
        invalidCoverPeriod as any,
        CoverAsset.ETH,
        buyerAddress,
      );
      expect(error?.message).toBe(`Invalid coverPeriod: must be at least ${MINIMUM_COVER_PERIOD} days`);
    },
  );

  const invalidCoverAssets = ['BTC', '', true, {}, null, undefined];
  it.each(invalidCoverAssets)('returns an error if coverAsset is invalid (%s)', async invalidCoverAsset => {
    const { error } = await getQuoteAndBuyCoverInputs(1, '100', 30, invalidCoverAsset as any, buyerAddress);
    expect(error?.message).toBe('Invalid coverAsset');
  });

  const invalidPaymentAssets = ['BTC', '', true, {}, null];
  it.each(invalidPaymentAssets)('returns an error if paymentAsset is invalid (%s)', async invalidPaymentAsset => {
    const { error } = await getQuoteAndBuyCoverInputs(
      1,
      '100',
      30,
      CoverAsset.ETH,
      buyerAddress,
      invalidPaymentAsset as any,
    );
    expect(error?.message).toBe('Invalid paymentAsset');
  });

  const invalidAddresses = ['0x123', '', true, {}, null, undefined];
  it.each(invalidAddresses)(
    'returns an error if coverBuyerAddress is not a valid Ethereum address (%s)',
    async invalidAddress => {
      const { error } = await getQuoteAndBuyCoverInputs(1, '100', 30, CoverAsset.ETH, invalidAddress as any);
      expect(error?.message).toBe('Invalid coverBuyerAddress: must be a valid Ethereum address');
    },
  );

  const invalidSlippages = [-0.1, 1.1, '0.1', '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5', true, {}, null];
  it.each(invalidSlippages)(
    'returns an error if slippage is not a number between 0 and 1 (%s)',
    async invalidSlippage => {
      const { error } = await getQuoteAndBuyCoverInputs(
        1,
        '100',
        30,
        CoverAsset.ETH,
        buyerAddress,
        CoverAsset.ETH,
        invalidSlippage as number,
      );
      expect(error?.message).toBe('Invalid slippage: must be a number between 0 and 1');
    },
  );

  const invalidIpfsData = ['123', 'Qm...', '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5', true, {}, null];
  it.each(invalidIpfsData)(
    'returns an error if ipfsData is not a valid IPFS base32 hash value (%s)',
    async invalidData => {
      const { error } = await getQuoteAndBuyCoverInputs(
        1,
        '100',
        30,
        CoverAsset.ETH,
        buyerAddress,
        CoverAsset.ETH,
        0.1,
        invalidData as string,
      );
      expect(error?.message).toBe('Invalid ipfsData: must be a valid IPFS base32 hash value');
    },
  );
});

describe('getMaxCapacity', () => {
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
    expect(getMaxCapacity(capacities)).toBe('1000');
  });

  it('should return "0" for empty input', () => {
    const capacities: PoolCapacity[] = [];
    expect(getMaxCapacity(capacities)).toBe('0');
  });

  it('handles large numbers correctly', () => {
    const capacities: PoolCapacity[] = [
      {
        poolId: '147',
        capacity: [{ assetId: '1', amount: '15369007199254740991' }], // Max JS value
      },
      {
        poolId: '148',
        capacity: [{ assetId: '1', amount: '1169007199254740991' }],
      },
    ];
    expect(getMaxCapacity(capacities)).toBe('16538014398509481982');
  });
});
