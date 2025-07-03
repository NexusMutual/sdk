import mockAxios from 'jest-mock-axios';
import { parseEther } from 'viem';

import {
  CoverAsset,
  PaymentAsset,
  MAXIMUM_COVER_PERIOD,
  MINIMUM_COVER_PERIOD,
  NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  SLIPPAGE_DENOMINATOR,
  TARGET_PRICE_DENOMINATOR,
  NEXUS_MUTUAL_COVER_COMMISSION_RATIO,
} from '../constants/cover';
import { Quote } from '../quote';
import {
  Address,
  CoverFreeText,
  CoverRouterProductCapacityResponse,
  CoverRouterQuoteResponse,
  CoverValidators,
  DefiPassContent,
} from '../types';
jest.mock('axios', () => mockAxios);
jest.setTimeout(10_000);

const coverRouterCapacityResponse: CoverRouterProductCapacityResponse = {
  productId: 150,
  availableCapacity: [
    { assetId: 0, amount: '4059218411110445069890' },
    { assetId: 1, amount: '14226889398669105671384084' },
    { assetId: 255, amount: '195995240000000000000000' },
  ],
  allocatedNxm: '5922960000000000000000',
  minAnnualPrice: '0.0425',
  maxAnnualPrice: '0.054178410067873985',
};

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

const quoteParams = {
  productId: 1,
  amount: '100',
  period: 30,
  coverAsset: CoverAsset.ETH,
  slippage: 0,
  ipfsCidOrContent: '',
  buyerAddress: '',
  paymentAsset: CoverAsset.ETH,
};

describe('getQuoteAndBuyCoverInputs', () => {
  let buyerAddress: Address;
  const DEFAULT_NEXUS_API_URL = 'https://api.nexusmutual.io/v2';
  let quoteApi: Quote;

  beforeAll(() => {
    buyerAddress = '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5';
    quoteParams.buyerAddress = '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5';
    quoteApi = new Quote();
  });

  beforeEach(() => {
    mockAxios.reset();
  });

  it('uses DEFAULT_NEXUS_API_URL if no API URL is supplied', async () => {
    mockAxios.get.mockResolvedValue({ data: {} });
    const productId = 1;
    const amount = '100';
    const period = 30;
    const coverAsset = CoverAsset.ETH;

    await quoteApi.getQuoteAndBuyCoverInputs({
      productId,
      amount,
      period,
      coverAsset,
      buyerAddress,
    });

    const defaultGetQuoteUrl = DEFAULT_NEXUS_API_URL + '/quote';
    expect(mockAxios.get).toHaveBeenCalledWith(defaultGetQuoteUrl, {
      params: { amount, coverAsset, period, productId, paymentAsset: coverAsset },
    });
  });

  it('allows the consumer to override nexusApiUrl param', async () => {
    mockAxios.get.mockResolvedValue({ data: {} });
    const url = 'http://hahahahahah';
    const quoteApi = new Quote({ apiUrl: url });
    const productId = 1;
    const amount = '100';
    const period = 30;
    const coverAsset = CoverAsset.ETH;

    await quoteApi.getQuoteAndBuyCoverInputs({
      productId,
      amount,
      period,
      coverAsset,
      buyerAddress,
      slippage: 0,
      ipfsCidOrContent: '',
    });

    const overrideGetQuoteUrl = url + '/quote';
    expect(mockAxios.get).toHaveBeenCalledWith(overrideGetQuoteUrl, {
      params: { amount, coverAsset, period, productId, paymentAsset: coverAsset },
    });
  });

  const invalidProductIds = [-1, 'a', true, {}, [], null, undefined];
  it.each(invalidProductIds)('returns an error if productId is not a positive integer (%s)', async invalidProductId => {
    const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      productId: invalidProductId as number,
    });
    expect(error?.message).toBe('Invalid productId: must be a positive integer');
  });

  const invalidCoverAmounts = [-1, 1, '100000.1', '-100', 'abc', true, {}, [], null, undefined];
  it.each(invalidCoverAmounts)(
    'returns an error if coverAmount is not a positive integer string (%s)',
    async invalidCoverAmount => {
      const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
        ...quoteParams,
        amount: invalidCoverAmount as string,
      });
      expect(error?.message).toBe('Invalid coverAmount: must be a positive integer string');
    },
  );

  const invalidCoverPeriods = [-1, 27, 366, '30', 'abc', true, {}, [], null, undefined];
  it.each(invalidCoverPeriods)('returns an error if coverPeriod is invalid (%s)', async invalidCoverPeriod => {
    const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      period: invalidCoverPeriod as number,
    });
    expect(error?.message).toBe(
      `Invalid coverPeriod: must be between ${MINIMUM_COVER_PERIOD} and ${MAXIMUM_COVER_PERIOD} days`,
    );
  });

  const invalidCoverAssets = ['BTC', '', true, {}, [], null, undefined];
  it.each(invalidCoverAssets)('returns an error if coverAsset is invalid (%s)', async invalidCoverAsset => {
    const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      coverAsset: invalidCoverAsset as CoverAsset,
    });
    const coverAssetsString = Object.keys(CoverAsset)
      .filter(k => isNaN(+k))
      .map(k => `CoverAsset.${k}`)
      .join(', ');
    expect(error?.message).toBe(`Invalid coverAsset: must be one of ${coverAssetsString}`);
  });

  it('returns an error if paymentAsset is invalid (%s)', async () => {
    const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      paymentAsset: PaymentAsset.USDC,
    });

    expect(error?.message).toBe(`Invalid payment asset: must be same as cover asset or NXM`);
  });

  const invalidAddresses = ['0x123', '', true, {}, [], null, undefined];
  it.each(invalidAddresses)(
    'returns an error if coverBuyerAddress is not a valid Ethereum address (%s)',
    async invalidAddress => {
      const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
        ...quoteParams,
        buyerAddress: invalidAddress as Address,
      });
      expect(error?.message).toBe('Invalid buyerAddress: must be a valid Ethereum address');
    },
  );

  const invalidSlippages = [-0.1, 100_01, '0.1', '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5', true, {}, [], null];
  it.each(invalidSlippages)(
    `returns an error if slippage is not a number between 0 and ${SLIPPAGE_DENOMINATOR} (%s)`,
    async invalidSlippage => {
      const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
        ...quoteParams,
        slippage: invalidSlippage as number,
      });
      expect(error?.message).toBe('Invalid slippage: must be a number between 0 and 1');
    },
  );

  const invalidIpfsData = [123, true];
  it.each(invalidIpfsData)(
    'returns an error if ipfsData is not a valid IPFS base32 hash value (%s)',
    async invalidData => {
      const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
        ...quoteParams,
        // @ts-expect-error invalid ipfsCidOrContent
        ipfsCidOrContent: invalidData,
      });
      mockAxios.get.mockResolvedValue({ data: {} });
      expect(error?.message).toBe('Invalid ipfsCidOrContent: must be a string CID or content object');
    },
  );

  it('returns an error if ipfsData is not a valid IPFS content for the product type - ETH Slashing', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: coverRouterQuoteResponse });
    mockAxios.get.mockResolvedValueOnce({ data: coverRouterCapacityResponse });

    const invalidContent: CoverFreeText = { version: '1.0', freeText: 'test' };
    const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      productId: 82,
      ipfsCidOrContent: invalidContent,
    });
    expect(JSON.parse(error?.message || '')).toEqual([
      {
        code: 'invalid_type',
        expected: 'array',
        received: 'undefined',
        path: ['validators'],
        message: 'Required',
      },
    ]);
  });

  it('returns an error if ipfsData content has an empty validators field for ETH Slashing product type', async () => {
    const emptyValidators: CoverValidators = { version: '1.0', validators: [] };
    const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      productId: 82,
      ipfsCidOrContent: emptyValidators,
    });
    expect(JSON.parse(error?.message || '')).toEqual([
      {
        code: 'too_small',
        minimum: 1,
        type: 'array',
        inclusive: true,
        exact: false,
        message: 'At least one validator address is required',
        path: ['validators'],
      },
    ]);
  });

  it('returns an error if ipfsData is not a valid IPFS content for the product type - UnoRe Quota Share', async () => {
    const invalidContent: CoverFreeText = { version: '1.0', freeText: 'test' };
    const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      productId: 107,
      ipfsCidOrContent: invalidContent,
    });
    expect(JSON.parse(error?.message || '')).toEqual([
      {
        code: 'invalid_type',
        expected: 'number',
        received: 'undefined',
        path: ['quotaShare'],
        message: 'Required',
      },
    ]);
  });

  it('returns an error if ipfsData is not a valid IPFS content for the product type - Fund Portfolio', async () => {
    const invalidContent: CoverFreeText = { version: '1.0', freeText: 'test' };
    const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      productId: 195,
      ipfsCidOrContent: invalidContent,
    });
    expect(JSON.parse(error?.message || '')).toEqual([
      {
        code: 'invalid_type',
        expected: 'number',
        received: 'undefined',
        path: ['aumCoverAmountPercentage'],
        message: 'Required',
      },
    ]);
  });

  it('returns an error if ipfsData is not a valid IPFS content for the product type - Nexus Mutual Cover', async () => {
    const invalidContent: CoverFreeText = { version: '1.0', freeText: 'test' };
    const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      ipfsCidOrContent: invalidContent,
      productId: 247,
    });
    expect(JSON.parse(error?.message || '')).toEqual([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['walletAddresses'],
        message: 'Required',
      },
    ]);
  });

  it('returns an error if ipfsData is not a valid IPFS content for Defi Pass', async () => {
    const emptyWalletsContent: DefiPassContent = { version: '1.0', wallets: [] };
    const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      ipfsCidOrContent: emptyWalletsContent,
      productId: 227,
    });
    expect(JSON.parse(error?.message || '')).toEqual([
      {
        code: 'too_small',
        minimum: 1,
        type: 'array',
        inclusive: true,
        exact: false,
        path: ['wallets'],
        message: 'At least one wallet object is required',
      },
    ]);
  });

  it('returns an error if ipfsData is not a valid IPFS content for the Defi Pass - empty address', async () => {
    const emptyWalletString: DefiPassContent = { version: '1.0', walletAddress: '' };
    const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      productId: 227,
      ipfsCidOrContent: emptyWalletString,
    });
    expect(JSON.parse(error?.message || '')).toEqual([
      {
        validation: 'regex',
        code: 'invalid_string',
        message: 'Invalid Ethereum address',
        path: ['walletAddress'],
      },
    ]);
  });

  it('allows the consumer to provide a valid IPFS CID', async () => {
    const ipfsCid = 'QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY';

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
    mockAxios.get.mockResolvedValueOnce({ data: coverRouterQuoteResponse });
    mockAxios.get.mockResolvedValueOnce({ data: coverRouterCapacityResponse });

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      productId: 247,
      ipfsCidOrContent: 'QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY',
    });

    expect(error).toBeUndefined();
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe(ipfsCid);
  });

  it('allows the consumer to provide a valid IPFS content', async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: {
        ipfsHash: 'QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY',
      },
    });

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
    mockAxios.get.mockResolvedValueOnce({ data: coverRouterQuoteResponse });
    mockAxios.get.mockResolvedValueOnce({ data: coverRouterCapacityResponse });

    const validEthAddress = '0x1234567890123456789012345678901234567890';
    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      productId: 247,
      ipfsCidOrContent: {
        version: '2.0',
        walletAddresses: [validEthAddress],
      },
    });

    expect(error).toBeUndefined();
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe('QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY');
  });

  it('returns an object with displayInfo and buyCoverInput parameters', async () => {
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
    mockAxios.get.mockResolvedValueOnce({ data: coverRouterQuoteResponse });
    mockAxios.get.mockResolvedValueOnce({ data: coverRouterCapacityResponse });

    const coverAmount = parseEther('100').toString();
    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      amount: coverAmount,
      ipfsCidOrContent: 'QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY',
    });

    const { premiumInAsset, annualPrice } = coverRouterQuoteResponse.quote;
    const expectedMaxPremiumInAsset = quoteApi.calculatePremiumWithCommissionAndSlippage(
      BigInt(premiumInAsset),
      NEXUS_MUTUAL_COVER_COMMISSION_RATIO,
    );
    const expectedYearlyCostPerc = quoteApi.calculatePremiumWithCommissionAndSlippage(
      BigInt(annualPrice),
      NEXUS_MUTUAL_COVER_COMMISSION_RATIO,
    );

    expect(error).toBeUndefined();
    expect(result?.displayInfo.premiumInAsset).toBe(expectedMaxPremiumInAsset.toString());
    expect(result?.displayInfo.coverAmount).toBe(coverAmount);
    expect(result?.displayInfo.yearlyCostPerc).toBe(Number(expectedYearlyCostPerc) / TARGET_PRICE_DENOMINATOR);
    expect(result?.displayInfo.maxCapacity).toBe(coverRouterCapacityResponse.availableCapacity[0]?.amount);
    expect(result?.buyCoverInput.buyCoverParams.coverId).toBe(0);
    expect(result?.buyCoverInput.buyCoverParams.owner).toBe(buyerAddress);
    expect(result?.buyCoverInput.buyCoverParams.productId).toBe(1);
    expect(result?.buyCoverInput.buyCoverParams.coverAsset).toBe(CoverAsset.ETH);
    expect(result?.buyCoverInput.buyCoverParams.amount).toBe(coverAmount);
    expect(result?.buyCoverInput.buyCoverParams.period).toBe(30 * 60 * 60 * 24);
    expect(result?.buyCoverInput.buyCoverParams.maxPremiumInAsset).toBe(expectedMaxPremiumInAsset.toString());
    expect(result?.buyCoverInput.buyCoverParams.paymentAsset).toBe(CoverAsset.ETH);
    expect(result?.buyCoverInput.buyCoverParams.commissionRatio).toBe(NEXUS_MUTUAL_COVER_COMMISSION_RATIO);
    expect(result?.buyCoverInput.buyCoverParams.commissionDestination).toBe(NEXUS_MUTUAL_DAO_TREASURY_ADDRESS);
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe('QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY');
    expect(mockAxios.get).toHaveBeenCalledTimes(2);
  });

  it('should handle "Not enough capacity for the cover amount" error correctly - ETH', async () => {
    mockAxios.get.mockReset();

    mockAxios.get.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: { error: 'Not enough capacity for the cover amount' },
      },
    });
    mockAxios.get.mockResolvedValueOnce({ data: coverRouterCapacityResponse });

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs(quoteParams);

    expect(result).toBeUndefined();
    expect(error?.message).toEqual('Not enough capacity for the cover amount');
    expect(error?.data?.maxCapacity).toEqual(coverRouterCapacityResponse.availableCapacity[0]?.amount);
  });

  it('should handle "Not enough capacity for the cover amount" error correctly - DAI', async () => {
    mockAxios.get.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: { error: 'Not enough capacity for the cover amount' },
      },
    });

    mockAxios.get.mockResolvedValueOnce({ data: coverRouterCapacityResponse });

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      amount: parseEther('100').toString(),
      coverAsset: CoverAsset.DAI,
      paymentAsset: PaymentAsset.DAI,
    });

    expect(result).toBeUndefined();
    expect(error?.message).toEqual('Not enough capacity for the cover amount');
    expect(error?.data?.maxCapacity).toEqual(coverRouterCapacityResponse.availableCapacity[1]?.amount);
  });
});
