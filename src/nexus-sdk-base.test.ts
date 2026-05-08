import fetchMock from 'jest-fetch-mock';

import { ApiError, NexusSDKBase, RequestConfig } from './nexus-sdk-base';

class TestSDKBase extends NexusSDKBase {
  public request<T>(endpoint: string, options: RequestConfig = {}) {
    return this.sendRequest<T>(endpoint, options);
  }
}

const captureError = async (promise: Promise<unknown>): Promise<ApiError> => {
  try {
    await promise;
    throw new Error('Expected promise to reject');
  } catch (err) {
    return err as ApiError;
  }
};

describe('NexusSDKBase.sendRequest', () => {
  const sdkBase = new TestSDKBase({ apiUrl: 'https://api.nexusmutual.io/v2' });

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('returns undefined for empty successful responses', async () => {
    fetchMock.mockResponseOnce('', { status: 204 });

    await expect(sdkBase.request('/empty')).resolves.toBeUndefined();
  });

  it('returns plain text for non-json successful responses', async () => {
    fetchMock.mockResponseOnce('ok', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });

    await expect(sdkBase.request<string>('/text')).resolves.toBe('ok');
  });

  it('parses JSON responses with charset suffix on the content-type', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ value: 42 }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });

    await expect(sdkBase.request<{ value: number }>('/json')).resolves.toEqual({ value: 42 });
  });

  it('parses vendor +json responses', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ value: 'v' }), {
      headers: { 'Content-Type': 'application/vnd.api+json' },
    });

    await expect(sdkBase.request<{ value: string }>('/vendor')).resolves.toEqual({ value: 'v' });
  });

  it('encodes params via URLSearchParams and skips undefined/null values', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}));

    await sdkBase.request('/quote', {
      params: { productId: 1, period: 30, missing: undefined, also: null },
    });

    const [calledUrl] = fetchMock.mock.calls[0]!;
    expect(calledUrl).toBe('https://api.nexusmutual.io/v2/quote?productId=1&period=30');
  });

  it('joins params with & when the endpoint already has a query string', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([]));

    await sdkBase.request('/product-types/5?withAttributes=ipfsContentType', {
      params: { include: 'meta' },
    });

    const [calledUrl] = fetchMock.mock.calls[0]!;
    expect(calledUrl).toBe('https://api.nexusmutual.io/v2/product-types/5?withAttributes=ipfsContentType&include=meta');
  });

  it('throws ApiError with the raw error message on "Not enough capacity" 4xx', async () => {
    const errorBody = { error: 'Not enough capacity for the cover amount' };
    fetchMock.mockResponseOnce(JSON.stringify(errorBody), { status: 400 });

    const error = await captureError(sdkBase.request('/quote'));
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.data).toEqual(errorBody);
    expect(error.message).toBe('Not enough capacity for the cover amount');
  });

  it('throws ApiError with a formatted message on other non-OK responses', async () => {
    const errorBody = { error: 'Internal failure' };
    fetchMock.mockResponseOnce(JSON.stringify(errorBody), { status: 500 });

    const error = await captureError(sdkBase.request('/quote'));
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(500);
    expect(error.data).toEqual(errorBody);
    expect(error.message).toBe('API request failed: 500 Internal failure');
  });

  it('falls back to statusText when the error body has no error field', async () => {
    fetchMock.mockResponseOnce('', { status: 502 });

    const error = await captureError(sdkBase.request('/quote'));
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(502);
    expect(error.message).toBe('API request failed: 502 Bad Gateway');
  });

  it('serializes data as JSON and sets Content-Type', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ ok: true }));

    await sdkBase.request('/ipfs', {
      method: 'POST',
      data: { type: 'coverFreeText', content: { freeText: 'hi' } },
    });

    const [, requestInit] = fetchMock.mock.calls[0]!;
    expect(requestInit?.method).toBe('POST');
    expect(requestInit?.body).toBe(JSON.stringify({ type: 'coverFreeText', content: { freeText: 'hi' } }));
    expect(requestInit?.headers).toEqual({ 'Content-Type': 'application/json' });
  });
});
