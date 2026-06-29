import fetchMock from 'jest-fetch-mock';

import { CoverData } from './Cover';
import { AuthSignature, EditCoverMetadataParams, ViewCoverMetadataParams } from '../types';

describe('CoverData', () => {
  const URL = 'https://api.test.io/upload/v2';
  const coverApi = new CoverData({ apiUrl: URL });

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('getCover', () => {
    it('returns an error if coverId is 0', async () => {
      const { error } = await coverApi.getCover(0);
      expect(error?.message).toBe('Invalid coverId: must be a positive number');
    });

    it('returns an error if coverId is negative', async () => {
      const { error } = await coverApi.getCover(-1);
      expect(error?.message).toBe('Invalid coverId: must be a positive number');
    });

    it('returns cover data on success', async () => {
      const mockCover = {
        coverId: 42,
        productId: 1,
        coverAsset: 0,
        amount: '1000000000000000000',
        start: '1700000000',
        period: '2592000',
        gracePeriod: '2592000',
      };
      fetchMock.mockResponseOnce(JSON.stringify(mockCover));

      const { result, error } = await coverApi.getCover(42);

      expect(error).toBeUndefined();
      expect(result).toEqual(mockCover);
      expect(fetchMock.mock.calls[0]?.[0]).toContain('/cover/42');
    });

    it('returns an error when the API request fails', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ error: 'Not found' }), { status: 404 });

      const { result, error } = await coverApi.getCover(999);

      expect(result).toBeUndefined();
      expect(error?.message).toContain('API request failed');
    });
  });

  describe('viewCoverMetadata', () => {
    const validParams: ViewCoverMetadataParams = {
      coverMetadataId: 'abc-123-def',
    };

    it('returns an error if coverMetadataId is empty', async () => {
      const { error } = await coverApi.viewCoverMetadata({ coverMetadataId: '' });
      expect(error?.message).toBe('Invalid coverMetadataId: must be a non-empty string');
    });

    it('returns an error if coverMetadataId is not a string', async () => {
      const { error } = await coverApi.viewCoverMetadata({
        coverMetadataId: 123 as unknown as string,
      });
      expect(error?.message).toBe('Invalid coverMetadataId: must be a non-empty string');
    });

    it('sends GET request without auth headers when no signature is provided', async () => {
      const mockResponse = {
        id: 'abc-123-def',
        coverId: 42,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
        publicData: { quotaShare: 50 },
      };
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const { result, error } = await coverApi.viewCoverMetadata(validParams);

      expect(error).toBeUndefined();
      expect(result).toEqual(mockResponse);

      const [, requestInit] = fetchMock.mock.calls[0]!;
      expect(requestInit?.headers).toBeUndefined();
    });

    it('sends GET request with auth headers when signature is provided', async () => {
      const signature: AuthSignature = {
        signature: '0xdeadbeef',
        payload: { timestamp: 1700000000n, message: 'test message' },
      };
      const mockResponse = {
        id: 'abc-123-def',
        coverId: 42,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
        publicData: null,
        privateData: { proofOfLoss: [{ type: 'address', content: [] }], createdAt: '2024-01-01T00:00:00Z' },
      };
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const { result, error } = await coverApi.viewCoverMetadata({
        ...validParams,
        signature,
      });

      expect(error).toBeUndefined();
      expect(result).toEqual(mockResponse);

      const [, requestInit] = fetchMock.mock.calls[0]!;
      const headers = requestInit?.headers as Record<string, string>;
      expect(headers['x-auth-signature']).toBe('0xdeadbeef');
      expect(headers['x-auth-payload']).toBe(JSON.stringify({ timestamp: '1700000000', message: 'test message' }));
    });

    it('serializes BigInt values in auth payload as strings', async () => {
      const signature: AuthSignature = {
        signature: '0xabc',
        payload: { timestamp: 9007199254740993n, message: 'big number' },
      };
      fetchMock.mockResponseOnce(JSON.stringify({ id: 'x' }));

      await coverApi.viewCoverMetadata({ ...validParams, signature });

      const [, requestInit] = fetchMock.mock.calls[0]!;
      const headers = requestInit?.headers as Record<string, string>;
      const parsed = JSON.parse(headers['x-auth-payload']!);
      expect(parsed.timestamp).toBe('9007199254740993');
    });

    it('returns an error when the API request fails', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ error: 'Server error' }), { status: 500 });

      const { result, error } = await coverApi.viewCoverMetadata(validParams);

      expect(result).toBeUndefined();
      expect(error?.message).toContain('API request failed');
    });
  });

  describe('editCoverMetadata', () => {
    const validSignature: AuthSignature = {
      signature: '0xdeadbeef',
      payload: { timestamp: 1700000000n, message: 'edit metadata' },
    };

    const validParams: EditCoverMetadataParams = {
      coverMetadataId: 'abc-123-def',
      proofOfLoss: [{ type: 'address', content: [{ address: '0x1234567890123456789012345678901234567890' }] }],
      signature: validSignature,
    };

    it('returns an error if coverMetadataId is empty', async () => {
      const { error } = await coverApi.editCoverMetadata({
        ...validParams,
        coverMetadataId: '',
      });
      expect(error?.message).toBe('Invalid coverMetadataId: must be a non-empty string');
    });

    it('returns an error if coverMetadataId is not a string', async () => {
      const { error } = await coverApi.editCoverMetadata({
        ...validParams,
        coverMetadataId: null as unknown as string,
      });
      expect(error?.message).toBe('Invalid coverMetadataId: must be a non-empty string');
    });

    it('returns an error if proofOfLoss is empty', async () => {
      const { error } = await coverApi.editCoverMetadata({
        ...validParams,
        proofOfLoss: [],
      });
      expect(error?.message).toBe('At least one proof of loss entry is required');
    });

    it('returns an error if proofOfLoss is not provided', async () => {
      const { error } = await coverApi.editCoverMetadata({
        ...validParams,
        proofOfLoss: undefined as unknown as EditCoverMetadataParams['proofOfLoss'],
      });
      expect(error?.message).toBe('At least one proof of loss entry is required');
    });

    it('returns an error if signature is missing', async () => {
      const { error } = await coverApi.editCoverMetadata({
        ...validParams,
        signature: undefined as unknown as AuthSignature,
      });
      expect(error?.message).toBe('Signature is required to edit cover metadata');
    });

    it('returns an error if signature.signature is empty', async () => {
      const { error } = await coverApi.editCoverMetadata({
        ...validParams,
        signature: { ...validSignature, signature: '' },
      });
      expect(error?.message).toBe('Signature is required to edit cover metadata');
    });

    it('returns an error if signature.payload is missing', async () => {
      const { error } = await coverApi.editCoverMetadata({
        ...validParams,
        signature: { signature: '0xabc', payload: undefined as unknown as AuthSignature['payload'] },
      });
      expect(error?.message).toBe('Signature is required to edit cover metadata');
    });

    it('sends PUT request with auth headers and proofOfLoss body', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

      const { result, error } = await coverApi.editCoverMetadata(validParams);

      expect(error).toBeUndefined();
      expect(result).toEqual({ success: true });

      const [calledUrl, requestInit] = fetchMock.mock.calls[0]!;
      expect(calledUrl).toContain('/cover-metadata/abc-123-def');
      expect(requestInit?.method).toBe('PUT');

      const headers = requestInit?.headers as Record<string, string>;
      expect(headers['x-auth-signature']).toBe('0xdeadbeef');
      expect(headers['x-auth-payload']).toContain('1700000000');

      const body = JSON.parse(requestInit?.body as string);
      expect(body.proofOfLoss).toEqual(validParams.proofOfLoss);
    });

    it('returns an error when the API request fails', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

      const { result, error } = await coverApi.editCoverMetadata(validParams);

      expect(result).toBeUndefined();
      expect(error?.message).toContain('API request failed');
    });
  });
});
