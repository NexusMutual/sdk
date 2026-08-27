import { parseEther } from 'ethers/lib/utils';
import fetchMock from 'jest-fetch-mock';

import {
  CoverAsset,
  PaymentAsset,
  MAXIMUM_COVER_PERIOD,
  MINIMUM_COVER_PERIOD,
  NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  SLIPPAGE_DENOMINATOR,
  TARGET_PRICE_DENOMINATOR,
} from '../constants/cover';
import { Quote } from '../quote';
import { Address, CoverRouterProductCapacityResponse, CoverRouterQuoteResponse } from '../types';
import { CoverMetadataInput } from '../types/cover-metadata';
import { Product, ProductType } from '../types/product';

jest.setTimeout(10_000);

const mockProduct: Product = {
  id: 1,
  productType: 1,
  name: 'Test Product',
  minPrice: '100',
  coverAssets: [{ assetId: CoverAsset.ETH, assetSymbol: 'ETH' }],
  initialPriceRatio: '100',
  capacityReductionRatio: '0',
  isDeprecated: false,
  useFixedPrice: false,
  metadata: '',
  allowedPools: [],
  logo: '',
  timestamp: 0,
  isPrivate: false,
};

const mockProductType: ProductType = {
  id: 1,
  name: 'Protocol',
  metadata: '',
  claimMethod: '0',
  gracePeriod: '30',
  assessmentCooldownPeriod: '0',
  payoutRedemptionPeriod: '0',
  commissionRatio: '500',
  commissionDestination: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
};

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

// Distinct from buyerAddress so tests prove the field is forwarded rather than inferred.
const creatorAddress = '0xc0ffee254729296a45a3885639ac7e10f9d54979';

const quoteParams = {
  productId: 1,
  amount: '100',
  period: 30,
  coverAsset: CoverAsset.ETH,
  slippage: 0,
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
    fetchMock.resetMocks();
  });

  it('uses DEFAULT_NEXUS_API_URL if no API URL is supplied', async () => {
    const productId = 1;
    const amount = '100';
    const period = 30;
    const coverAsset = CoverAsset.ETH;

    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(mockProductType));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterQuoteResponse));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterCapacityResponse));

    await quoteApi.getQuoteAndBuyCoverInputs({
      productId,
      amount,
      period,
      coverAsset,
      buyerAddress,
    });

    const defaultGetProductUrl = DEFAULT_NEXUS_API_URL + '/products/1';
    expect(fetchMock.mock.calls[0]?.[0]).toBe(defaultGetProductUrl);
  });

  it('allows the consumer to override nexusApiUrl param', async () => {
    const url = 'http://hahahahahah';
    const quoteApi = new Quote({ apiUrl: url });
    const productId = 1;
    const amount = '100';
    const period = 30;
    const coverAsset = CoverAsset.ETH;

    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(mockProductType));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterQuoteResponse));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterCapacityResponse));

    await quoteApi.getQuoteAndBuyCoverInputs({
      productId,
      amount,
      period,
      coverAsset,
      buyerAddress,
      slippage: 0,
    });

    const overrideGetProductUrl = url + '/products/1';
    expect(fetchMock.mock.calls[0]?.[0]).toBe(overrideGetProductUrl);
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

  it('returns an error when proofOfLossInputTypes is set and coverMetadata is not provided', async () => {
    const productWithRequiredProof: Product = {
      ...mockProduct,
      id: 82,
      productType: 5,
      proofOfLossInputTypes: ['validator'],
    };
    const productTypeWithRequiredProof: ProductType = {
      ...mockProductType,
      id: 5,
      name: 'ETH Slashing',
    };

    fetchMock.mockResponseOnce(JSON.stringify(productWithRequiredProof));
    fetchMock.mockResponseOnce(JSON.stringify(productTypeWithRequiredProof));

    const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      productId: 82,
    });

    expect(error?.message).toBe('Missing cover metadata. ETH Slashing requires proof of loss data.');
  });

  it('calls POST /cover-metadata when coverMetadata is provided and uses the returned CID', async () => {
    const mockCid = 'QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY';
    const productWithProof: Product = {
      ...mockProduct,
      id: 82,
      productType: 5,
      proofOfLossInputTypes: ['validator'],
    };
    const productTypeWithProof: ProductType = {
      ...mockProductType,
      id: 5,
    };

    fetchMock.mockResponseOnce(JSON.stringify(productWithProof));
    fetchMock.mockResponseOnce(JSON.stringify(productTypeWithProof));
    fetchMock.mockResponseOnce(JSON.stringify({ cid: mockCid }));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterQuoteResponse));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterCapacityResponse));

    const coverMetadata: CoverMetadataInput = {
      creatorAddress,
      proofOfLoss: [{ type: 'validator', content: [{ value: '0x1234567890123456789012345678901234567890' }] }],
    };

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      productId: 82,
      coverMetadata,
    });

    expect(error).toBeUndefined();
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe(mockCid);

    const coverMetadataCall = fetchMock.mock.calls[2];
    expect(coverMetadataCall?.[0]).toContain('/cover-metadata');
    expect(coverMetadataCall?.[1]?.method).toBe('POST');
    const body = JSON.parse(coverMetadataCall?.[1]?.body as string);
    expect(body.creatorAddress).toBe(creatorAddress);
    expect(body.proofOfLoss).toEqual(coverMetadata.proofOfLoss);
  });

  it('calls POST /cover-metadata when only publicData is provided', async () => {
    const mockCid = 'QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY';

    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(mockProductType));
    fetchMock.mockResponseOnce(JSON.stringify({ cid: mockCid }));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterQuoteResponse));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterCapacityResponse));

    const coverMetadata: CoverMetadataInput = {
      creatorAddress,
      publicData: { quotaShare: 50 },
    };

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      coverMetadata,
    });

    expect(error).toBeUndefined();
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe(mockCid);
  });

  it.each([
    ['an empty string', ''],
    ['a malformed address', '0x123'],
    ['a non-string value', undefined as unknown as string],
  ])('returns an error when creatorAddress is %s', async (_label, invalidCreatorAddress) => {
    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(mockProductType));

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      coverMetadata: {
        creatorAddress: invalidCreatorAddress,
        publicData: { quotaShare: 50 },
      },
    });

    expect(result).toBeUndefined();
    expect(error?.message).toBe('Invalid creatorAddress: must be a valid EVM address');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not call POST /cover-metadata when coverMetadata is not provided', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(mockProductType));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterQuoteResponse));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterCapacityResponse));

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs(quoteParams);

    expect(error).toBeUndefined();
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe('');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('uses ipfsCid directly without calling POST /cover-metadata', async () => {
    const existingCid = 'QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY';

    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(mockProductType));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterQuoteResponse));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterCapacityResponse));

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      ipfsCid: existingCid,
    });

    expect(error).toBeUndefined();
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe(existingCid);
    // 4 calls: getProduct, getProductType, getQuote, getCapacity (no cover-metadata call)
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('skips coverMetadata validation when ipfsCid is provided', async () => {
    const existingCid = 'QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY';
    const productWithRequiredProof: Product = {
      ...mockProduct,
      id: 82,
      productType: 5,
      proofOfLossInputTypes: ['validator'],
    };
    const productTypeWithRequiredProof: ProductType = {
      ...mockProductType,
      id: 5,
      name: 'ETH Slashing',
    };

    fetchMock.mockResponseOnce(JSON.stringify(productWithRequiredProof));
    fetchMock.mockResponseOnce(JSON.stringify(productTypeWithRequiredProof));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterQuoteResponse));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterCapacityResponse));

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      productId: 82,
      ipfsCid: existingCid,
    });

    expect(error).toBeUndefined();
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe(existingCid);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('handles cover edit flow with ipfsCid and coverId > 0', async () => {
    const existingCid = 'QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY';

    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(mockProductType));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterQuoteResponse));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterCapacityResponse));

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      coverId: 42,
      ipfsCid: existingCid,
    });

    expect(error).toBeUndefined();
    expect(result?.buyCoverInput.buyCoverParams.coverId).toBe(42);
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe(existingCid);

    const quoteCall = fetchMock.mock.calls[2];
    expect(quoteCall?.[0]).toContain('coverEditId=42');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('returns an error when POST /cover-metadata fails', async () => {
    const productWithProof: Product = {
      ...mockProduct,
      id: 82,
      productType: 5,
      proofOfLossInputTypes: ['address'],
    };
    const productTypeWithProof: ProductType = {
      ...mockProductType,
      id: 5,
    };

    fetchMock.mockResponseOnce(JSON.stringify(productWithProof));
    fetchMock.mockResponseOnce(JSON.stringify(productTypeWithProof));
    fetchMock.mockResponseOnce(JSON.stringify({ error: 'Internal server error' }), { status: 500 });

    const coverMetadata: CoverMetadataInput = {
      creatorAddress,
      proofOfLoss: [{ type: 'address', content: [{ address: '0x1234567890123456789012345678901234567890' }] }],
    };

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      productId: 82,
      coverMetadata,
    });

    expect(result).toBeUndefined();
    expect(error?.message).toContain('API request failed');
  });

  it('returns an error when proofOfLossInputTypes is set and coverMetadata has no proofOfLoss', async () => {
    const productWithRequiredProof: Product = {
      ...mockProduct,
      id: 82,
      productType: 5,
      proofOfLossInputTypes: ['validator'],
    };
    const productTypeWithRequiredProof: ProductType = {
      ...mockProductType,
      id: 5,
      name: 'ETH Slashing',
    };

    fetchMock.mockResponseOnce(JSON.stringify(productWithRequiredProof));
    fetchMock.mockResponseOnce(JSON.stringify(productTypeWithRequiredProof));

    const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      productId: 82,
      coverMetadata: { creatorAddress, publicData: { quotaShare: 50 } },
    });

    expect(error?.message).toBe('Missing cover metadata. ETH Slashing requires proof of loss data.');
  });

  it('returns an error when proofOfLossInputTypes is set and proofOfLoss is an empty array', async () => {
    const productWithRequiredProof: Product = {
      ...mockProduct,
      id: 82,
      productType: 5,
      proofOfLossInputTypes: ['validator'],
    };
    const productTypeWithRequiredProof: ProductType = {
      ...mockProductType,
      id: 5,
      name: 'ETH Slashing',
    };

    fetchMock.mockResponseOnce(JSON.stringify(productWithRequiredProof));
    fetchMock.mockResponseOnce(JSON.stringify(productTypeWithRequiredProof));

    const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      productId: 82,
      coverMetadata: { creatorAddress, proofOfLoss: [] },
    });

    expect(error?.message).toBe('Missing cover metadata. ETH Slashing requires proof of loss data.');
  });

  it('returns an error when required proof of loss types are missing', async () => {
    const productWithTypes: Product = {
      ...mockProduct,
      id: 82,
      productType: 5,
      proofOfLossInputTypes: ['address', 'validator'],
    };
    const productTypeWithProof: ProductType = {
      ...mockProductType,
      id: 5,
    };

    fetchMock.mockResponseOnce(JSON.stringify(productWithTypes));
    fetchMock.mockResponseOnce(JSON.stringify(productTypeWithProof));

    const coverMetadata: CoverMetadataInput = {
      creatorAddress,
      proofOfLoss: [{ type: 'address', content: [{ address: '0x1234567890123456789012345678901234567890' }] }],
    };

    const { error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      productId: 82,
      coverMetadata,
    });

    expect(error?.message).toBe('Missing required proof of loss types. Required: address, validator');
  });

  it('succeeds when all required proof of loss types are provided', async () => {
    const mockCid = 'QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY';
    const productWithTypes: Product = {
      ...mockProduct,
      id: 82,
      productType: 5,
      proofOfLossInputTypes: ['address', 'validator'],
    };
    const productTypeWithProof: ProductType = {
      ...mockProductType,
      id: 5,
    };

    fetchMock.mockResponseOnce(JSON.stringify(productWithTypes));
    fetchMock.mockResponseOnce(JSON.stringify(productTypeWithProof));
    fetchMock.mockResponseOnce(JSON.stringify({ cid: mockCid }));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterQuoteResponse));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterCapacityResponse));

    const coverMetadata: CoverMetadataInput = {
      creatorAddress,
      proofOfLoss: [
        { type: 'address', content: [{ address: '0x1234567890123456789012345678901234567890' }] },
        { type: 'validator', content: [{ value: '0x1234567890123456789012345678901234567890' }] },
      ],
    };

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      productId: 82,
      coverMetadata,
    });

    expect(error).toBeUndefined();
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe(mockCid);
  });

  it('does not call POST /cover-metadata when publicData is an empty object', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(mockProductType));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterQuoteResponse));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterCapacityResponse));

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      coverMetadata: { creatorAddress, publicData: {} },
    });

    expect(error).toBeUndefined();
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe('');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('does not call POST /cover-metadata when coverMetadata has only creatorAddress', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(mockProductType));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterQuoteResponse));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterCapacityResponse));

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      coverMetadata: { creatorAddress },
    });

    expect(error).toBeUndefined();
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe('');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('handles cover edit flow with coverId > 0 and coverMetadata', async () => {
    const mockCid = 'QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY';

    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(mockProductType));
    fetchMock.mockResponseOnce(JSON.stringify({ cid: mockCid }));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterQuoteResponse));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterCapacityResponse));

    const coverMetadata: CoverMetadataInput = {
      creatorAddress,
      proofOfLoss: [{ type: 'address', content: [{ address: '0x1234567890123456789012345678901234567890' }] }],
    };

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      coverId: 42,
      coverMetadata,
    });

    expect(error).toBeUndefined();
    expect(result?.buyCoverInput.buyCoverParams.coverId).toBe(42);
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe(mockCid);

    const quoteCall = fetchMock.mock.calls[3];
    expect(quoteCall?.[0]).toContain('coverEditId=42');
  });

  it('returns an object with displayInfo and buyCoverInput parameters', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(mockProductType));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterQuoteResponse));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterCapacityResponse));

    const coverAmount = parseEther('100').toString();
    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      amount: coverAmount,
    });

    const { premiumInAsset, annualPrice } = coverRouterQuoteResponse.quote;
    const expectedMaxPremiumInAsset = quoteApi.calculatePremiumWithCommissionAndSlippage(
      BigInt(premiumInAsset),
      +mockProductType.commissionRatio,
    );
    const expectedYearlyCostPerc = quoteApi.calculatePremiumWithCommissionAndSlippage(
      BigInt(annualPrice),
      +mockProductType.commissionRatio,
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
    expect(result?.buyCoverInput.buyCoverParams.commissionRatio).toBe(+mockProductType.commissionRatio);
    expect(result?.buyCoverInput.buyCoverParams.commissionDestination).toBe(mockProductType.commissionDestination);
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe('');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('should handle "Not enough capacity for the cover amount" error correctly - ETH', async () => {
    fetchMock.mockReset();

    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(mockProductType));
    fetchMock.mockResponseOnce(JSON.stringify({ error: 'Not enough capacity for the cover amount' }), { status: 400 });
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterCapacityResponse));

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs(quoteParams);

    expect(result).toBeUndefined();
    expect(error?.message).toEqual('Not enough capacity for the cover amount');
    expect(error?.data?.maxCapacity).toEqual(coverRouterCapacityResponse.availableCapacity[0]?.amount);
  });

  it('should handle "Not enough capacity for the cover amount" error correctly - DAI', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(mockProductType));
    fetchMock.mockResponseOnce(JSON.stringify({ error: 'Not enough capacity for the cover amount' }), { status: 400 });

    fetchMock.mockResponseOnce(JSON.stringify(coverRouterCapacityResponse));

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

  it('returns an error when buyCoverForm is withAUM and aumCoverAmountPercentage is not provided', async () => {
    const productTypeWithAUM: ProductType = {
      ...mockProductType,
      buyCoverForm: 'withAUM',
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(productTypeWithAUM));

    const { error } = await quoteApi.getQuoteAndBuyCoverInputs(quoteParams);

    expect(error?.message).toBe('Missing AUM cover amount percentage data');
  });

  it('returns an error when buyCoverForm is withQuotaShare and quotaShare is not provided', async () => {
    const productTypeWithQuotaShare: ProductType = {
      ...mockProductType,
      buyCoverForm: 'withQuotaShare',
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(productTypeWithQuotaShare));

    const { error } = await quoteApi.getQuoteAndBuyCoverInputs(quoteParams);

    expect(error?.message).toBe('Missing quota share data');
  });

  it('succeeds when buyCoverForm is withAUM and aumCoverAmountPercentage is provided', async () => {
    const mockCid = 'QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY';
    const productTypeWithAUM: ProductType = {
      ...mockProductType,
      buyCoverForm: 'withAUM',
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(productTypeWithAUM));
    fetchMock.mockResponseOnce(JSON.stringify({ cid: mockCid }));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterQuoteResponse));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterCapacityResponse));

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      coverMetadata: { creatorAddress, publicData: { aumCoverAmountPercentage: 25 } },
    });

    expect(error).toBeUndefined();
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe(mockCid);
  });

  it('succeeds when buyCoverForm is withQuotaShare and quotaShare is provided', async () => {
    const mockCid = 'QmYfSDbuQLqJ2MAG3ATRjUPVFQubAhAM5oiYuuu9Kfs8RY';
    const productTypeWithQuotaShare: ProductType = {
      ...mockProductType,
      buyCoverForm: 'withQuotaShare',
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(productTypeWithQuotaShare));
    fetchMock.mockResponseOnce(JSON.stringify({ cid: mockCid }));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterQuoteResponse));
    fetchMock.mockResponseOnce(JSON.stringify(coverRouterCapacityResponse));

    const { result, error } = await quoteApi.getQuoteAndBuyCoverInputs({
      ...quoteParams,
      coverMetadata: { creatorAddress, publicData: { quotaShare: 50 } },
    });

    expect(error).toBeUndefined();
    expect(result?.buyCoverInput.buyCoverParams.ipfsData).toBe(mockCid);
  });

  it('returns an error when product has no productType', async () => {
    const productWithoutType = { ...mockProduct, productType: undefined };

    fetchMock.mockResponseOnce(JSON.stringify(productWithoutType));

    const { error } = await quoteApi.getQuoteAndBuyCoverInputs(quoteParams);

    expect(error?.message).toBe('Invalid product');
  });

  it('returns an error when productType is not found', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockProduct));
    fetchMock.mockResponseOnce(JSON.stringify(null));

    const { error } = await quoteApi.getQuoteAndBuyCoverInputs(quoteParams);

    expect(error?.message).toBe('Invalid product type');
  });

  it('returns an error when product fetch throws', async () => {
    fetchMock.mockRejectOnce(new Error('Network error'));

    const { error } = await quoteApi.getQuoteAndBuyCoverInputs(quoteParams);

    expect(error?.message).toBe('Network error');
  });
});
