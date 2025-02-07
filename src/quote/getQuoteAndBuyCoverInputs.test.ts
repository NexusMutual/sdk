import mockAxios from 'jest-mock-axios';
import { parseEther } from 'viem';

import { getQuoteAndBuyCoverInputs, productsMap } from './getQuoteAndBuyCoverInputs';
import productTypes from '../../generated/product-types.json';
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
import {
  Address,
  CoverFreeText,
  CoverRouterProductCapacityResponse,
  CoverRouterQuoteResponse,
  CoverValidators,
  CoverWalletAddresses,
  DefiPassContent,
  IPFS_CONTENT_TYPE_BY_PRODUCT_TYPE,
} from '../types';

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

describe('getQuoteAndBuyCoverInputs', () => {
  let buyerAddress: Address;
  const DEFAULT_NEXUS_API_URL = 'https://api.nexusmutual.io/v2';
  const TEST_API_URL = 'https://api.test.io/v2';
  const validEthAddress = '0x1234567890123456789012345678901234567890';

  beforeAll(() => {
    jest.mock('axios');
    buyerAddress = '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5';
  });

  beforeEach(() => {
    mockAxios.reset();
  });

  it('uses DEFAULT_NEXUS_API_URL if no API URL is supplied', async () => {
    // Mock both the quote and capacity responses
    mockAxios.get.mockResolvedValueOnce({ data: {} }); // quote response

    const productId = 1;
    const amount = '100';
    const period = 30;
    const coverAsset = CoverAsset.ETH;

    await getQuoteAndBuyCoverInputs(productId, amount, period, coverAsset, buyerAddress);

    const expectedParams = { amount, coverAsset, period, productId };
    const defaultGetQuoteUrl = DEFAULT_NEXUS_API_URL + '/quote';
    expect(mockAxios.get).toHaveBeenCalledWith(defaultGetQuoteUrl, { params: expectedParams });
  });

  it('allows the consumer to override nexusApiUrl param', async () => {
    mockAxios.get.mockResolvedValue({ data: {} });
    const url = 'http://hahahahahah';
    const productId = 1;
    const amount = '100';
    const period = 30;
    const coverAsset = CoverAsset.ETH;

    await getQuoteAndBuyCoverInputs(productId, amount, period, coverAsset, buyerAddress, 0, undefined, url);

    const overrideGetQuoteUrl = url + '/quote';
    const expectedParams = { amount, coverAsset, period, productId };
    expect(mockAxios.get).toHaveBeenCalledWith(overrideGetQuoteUrl, { params: expectedParams });
  });

  const invalidProductIds = [-1, 'a', true, {}, [], null, undefined];
  it.each(invalidProductIds)('returns an error if productId is not a positive integer (%s)', async invalidProductId => {
    const { error } = await getQuoteAndBuyCoverInputs(
      invalidProductId as number,
      '100',
      30,
      CoverAsset.ETH,
      buyerAddress,
      0,
      undefined,
      TEST_API_URL,
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
        0,
        undefined,
        TEST_API_URL,
      );
      expect(error?.message).toBe('Invalid coverAmount: must be a positive integer string');
    },
  );

  const invalidCoverPeriods = [-1, 27, 366, '30', 'abc', true, {}, [], null, undefined];
  it.each(invalidCoverPeriods)('returns an error if coverPeriod is invalid (%s)', async invalidCoverPeriod => {
    const { error } = await getQuoteAndBuyCoverInputs(
      1,
      '100',
      invalidCoverPeriod as number,
      CoverAsset.ETH,
      buyerAddress,
      0,
      undefined,
      TEST_API_URL,
    );
    expect(error?.message).toBe(
      `Invalid coverPeriod: must be between ${MINIMUM_COVER_PERIOD} and ${MAXIMUM_COVER_PERIOD} days`,
    );
  });

  const invalidCoverAssets = ['BTC', '', true, {}, [], null, undefined];
  it.each(invalidCoverAssets)('returns an error if coverAsset is invalid (%s)', async invalidCoverAsset => {
    const { error } = await getQuoteAndBuyCoverInputs(1, '100', 30, invalidCoverAsset as CoverAsset, buyerAddress);
    const coverAssetsString = Object.keys(CoverAsset)
      .filter(k => isNaN(+k))
      .map(k => `CoverAsset.${k}`)
      .join(', ');
    expect(error?.message).toBe(`Invalid coverAsset: must be one of ${coverAssetsString}`);
  });

  const invalidAddresses = ['0x123', '', true, {}, [], null, undefined];
  it.each(invalidAddresses)(
    'returns an error if coverBuyerAddress is not a valid Ethereum address (%s)',
    async invalidAddress => {
      const { error } = await getQuoteAndBuyCoverInputs(1, '100', 30, CoverAsset.ETH, invalidAddress as Address);
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
        undefined,
        TEST_API_URL,
      );
      expect(error?.message).toBe('Invalid slippage: must be a number between 0 and 1');
    },
  );

  const invalidVersionTests = [
    ['QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY', 'IPFS CID string'],
    ['some random string', 'random string'],
    [{}, 'empty object'],
    [{ freeText: 'test' }, 'object without version'],
    [[], 'empty array'],
    [1, 'number'],
    [{ version: null }, 'object with null version'],
    [{ version: undefined }, 'object with undefined version'],
    [{ version: 123 }, 'object with non-string version'],
  ] as const;

  it.each(invalidVersionTests)('returns Invalid IPFS content error when ipfsContent has %s', async invalidContent => {
    const { error } = await getQuoteAndBuyCoverInputs(
      247,
      '100',
      30,
      CoverAsset.ETH,
      buyerAddress,
      0.1,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      invalidContent as any,
    );

    expect(error?.message).toBe('Invalid IPFS content. Must have version field as string');
  });

  it('returns Missing IPFS content error when ipfsContent is not provided for required product type', async () => {
    const productId = 247; // Assuming this is a product that requires IPFS content
    const expectedProductType = productsMap[productId]?.productType;
    const expectedContentType = IPFS_CONTENT_TYPE_BY_PRODUCT_TYPE[expectedProductType!];
    const expectedProductName = productTypes[expectedProductType!]?.name;

    const { error } = await getQuoteAndBuyCoverInputs(
      productId,
      '100',
      30,
      CoverAsset.ETH,
      buyerAddress,
      0.1,
      undefined,
    );

    const expectedErr = `Missing IPFS content. \n${expectedProductName} requires ${expectedContentType} content type.`;
    expect(error?.message).toBe(expectedErr);
  });

  it('returns an error if ipfsData is not a valid IPFS content for the product type - ETH Slashing', async () => {
    const invalidContent: CoverFreeText = { version: '1.0', freeText: 'test' };
    const { error } = await getQuoteAndBuyCoverInputs(
      82,
      '100',
      30,
      CoverAsset.ETH,
      buyerAddress,
      0.1,
      invalidContent,
      TEST_API_URL,
    );
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
    const { error } = await getQuoteAndBuyCoverInputs(
      82,
      '100',
      30,
      CoverAsset.ETH,
      buyerAddress,
      0.1,
      emptyValidators,
      TEST_API_URL,
    );
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
    const { error } = await getQuoteAndBuyCoverInputs(
      107,
      '100',
      30,
      CoverAsset.ETH,
      buyerAddress,
      0.1,
      invalidContent,
      TEST_API_URL,
    );
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
    const { error } = await getQuoteAndBuyCoverInputs(
      195,
      '100',
      30,
      CoverAsset.ETH,
      buyerAddress,
      0.1,
      invalidContent,
      TEST_API_URL,
    );
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
    const { error } = await getQuoteAndBuyCoverInputs(
      247,
      '100',
      30,
      CoverAsset.ETH,
      buyerAddress,
      0.1,
      invalidContent,
      TEST_API_URL,
    );
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
    const { error } = await getQuoteAndBuyCoverInputs(
      227,
      '100',
      30,
      CoverAsset.ETH,
      buyerAddress,
      0.1,
      emptyWalletsContent,
      TEST_API_URL,
    );
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
    const { error } = await getQuoteAndBuyCoverInputs(
      227,
      '100',
      30,
      CoverAsset.ETH,
      buyerAddress,
      0.1,
      emptyWalletString,
      TEST_API_URL,
    );
    expect(JSON.parse(error?.message || '')).toEqual([
      {
        validation: 'regex',
        code: 'invalid_string',
        message: 'Invalid Ethereum address',
        path: ['walletAddress'],
      },
    ]);
  });

  it('returns an error if the ipfs content could not be uploaded', async () => {
    mockAxios.get.mockRejectedValueOnce({ message: 'Failed to upload IPFS content' });

    const { error } = await getQuoteAndBuyCoverInputs(1, '100', 30, CoverAsset.ETH, buyerAddress, 0.1, {
      version: '1.0',
      freeText: 'test',
    });
    expect(error?.message).toBe('Failed to upload IPFS content');
  });

  it('allows the consumer to skip passing ipfsContent if the productType does not need it', async () => {
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
    mockAxios.get
      .mockResolvedValueOnce({ data: coverRouterQuoteResponse })
      .mockResolvedValueOnce({ data: coverRouterCapacityResponse });
    mockAxios.post.mockResolvedValueOnce({ data: { ipfsHash: 'QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY' } });

    // productId 1 (productType 0: Protocol) does not require ipfsContent
    const undefinedIpfsContent = undefined;
    const { result, error } = await getQuoteAndBuyCoverInputs(
      1,
      '100',
      30,
      CoverAsset.ETH,
      buyerAddress,
      0.1,
      undefinedIpfsContent,
    );

    expect(error).toBeUndefined();
    // ipfsContent not required so ipfsData is empty string
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe('');
    expect(result?.buyCoverInput.poolAllocationRequests).not.toHaveLength(0);
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

    const { result, error } = await getQuoteAndBuyCoverInputs(247, '100', 30, CoverAsset.ETH, buyerAddress, 0.1, {
      version: '2.0',
      walletAddresses: [validEthAddress],
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
    mockAxios.post.mockResolvedValue({ data: { ipfsHash: 'QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY' } });

    const coverAmount = parseEther('100').toString();
    const ipfsContent: CoverWalletAddresses = { version: '2.0', walletAddresses: [validEthAddress] };
    const { result, error } = await getQuoteAndBuyCoverInputs(
      247, // productId
      coverAmount,
      28, // coverPeriod
      CoverAsset.ETH, // coverAsset
      buyerAddress, // coverBuyerAddress
      0.01, // slippage
      ipfsContent,
    );

    const { premiumInAsset, annualPrice } = coverRouterQuoteResponse.quote;
    const expectedMaxPremiumInAsset = calculatePremiumWithCommissionAndSlippage(
      BigInt(premiumInAsset),
      DEFAULT_COMMISSION_RATIO,
      0.01 * SLIPPAGE_DENOMINATOR,
    );
    const expectedYearlyCostPerc = calculatePremiumWithCommissionAndSlippage(
      BigInt(annualPrice),
      DEFAULT_COMMISSION_RATIO,
      0.01 * SLIPPAGE_DENOMINATOR,
    );

    expect(error).toBeUndefined();
    expect(result?.displayInfo.premiumInAsset).toBe(expectedMaxPremiumInAsset.toString());
    expect(result?.displayInfo.coverAmount).toBe(coverAmount);
    expect(result?.displayInfo.yearlyCostPerc).toBe(Number(expectedYearlyCostPerc) / TARGET_PRICE_DENOMINATOR);
    expect(result?.displayInfo.maxCapacity).toBe(coverRouterCapacityResponse.availableCapacity[0]?.amount);
    expect(result?.buyCoverInput.buyCoverParams.coverId).toBe(CoverId.BUY);
    expect(result?.buyCoverInput.buyCoverParams.owner).toBe(buyerAddress);
    expect(result?.buyCoverInput.buyCoverParams.productId).toBe(247);
    expect(result?.buyCoverInput.buyCoverParams.coverAsset).toBe(CoverAsset.ETH);
    expect(result?.buyCoverInput.buyCoverParams.amount).toBe(coverAmount);
    expect(result?.buyCoverInput.buyCoverParams.period).toBe(28 * 60 * 60 * 24);
    expect(result?.buyCoverInput.buyCoverParams.maxPremiumInAsset).toBe(expectedMaxPremiumInAsset.toString());
    expect(result?.buyCoverInput.buyCoverParams.paymentAsset).toBe(CoverAsset.ETH);
    expect(result?.buyCoverInput.buyCoverParams.commissionRatio).toBe(DEFAULT_COMMISSION_RATIO);
    expect(result?.buyCoverInput.buyCoverParams.commissionDestination).toBe(NEXUS_MUTUAL_DAO_TREASURY_ADDRESS);
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe('QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY');
    expect(mockAxios.get).toHaveBeenCalledTimes(2);
  });

  it('should handle "Not enough capacity for the cover amount" error correctly - ETH', async () => {
    mockAxios.get.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: { error: 'Not enough capacity for the cover amount' },
      },
    });

    mockAxios.get.mockResolvedValueOnce({ data: coverRouterCapacityResponse });

    const { result, error } = await getQuoteAndBuyCoverInputs(
      1,
      parseEther('100').toString(),
      28,
      CoverAsset.ETH,
      buyerAddress,
    );

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

    const { result, error } = await getQuoteAndBuyCoverInputs(
      1,
      parseEther('100').toString(),
      28,
      CoverAsset.DAI,
      buyerAddress,
    );

    expect(result).toBeUndefined();
    expect(error?.message).toEqual('Not enough capacity for the cover amount');
    expect(error?.data?.maxCapacity).toEqual(coverRouterCapacityResponse.availableCapacity[1]?.amount);
  });
});
