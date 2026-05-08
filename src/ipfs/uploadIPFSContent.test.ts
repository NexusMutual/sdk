import fetchMock from 'jest-fetch-mock';

import { Ipfs } from './Ipfs';
import { version } from '../../generated/version.json';
import { ContentType, CoverFreeText } from '../types/ipfs';
const URL = 'https://api.test.io/upload/v2';

describe('uploadIPFSContent', () => {
  const coverFreeTextContent: CoverFreeText = {
    version: '1.0',
    freeText: 'test',
  };
  const ipfsApi = new Ipfs({ apiUrl: URL });

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should throw an error if content is empty', async () => {
    const res = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ipfsApi.uploadIPFSContent([ContentType.coverFreeText, undefined as any]);
    };
    expect(res).rejects.toThrow('Content cannot be empty');
  });

  it('should call the ipfs upload endpoint with the correct data', async () => {
    const expectedHash = 'QmZ4w2yH';
    fetchMock.mockResponseOnce(JSON.stringify({ ipfsHash: expectedHash }));

    await ipfsApi.uploadIPFSContent([ContentType.coverFreeText, coverFreeTextContent]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, calledInit] = fetchMock.mock.calls[0]!;
    expect(calledUrl).toBe(`${URL}/ipfs?sdk=${version}`);
    expect(calledInit?.method).toBe('POST');
    expect(calledInit?.body).toBe(JSON.stringify({ type: ContentType.coverFreeText, content: coverFreeTextContent }));
    expect(calledInit?.headers).toEqual({ 'Content-Type': 'application/json' });
  });

  it('should return the ipfs hash on successful upload', async () => {
    const expectedHash = 'QmZ4w2yH9oF';
    fetchMock.mockResponseOnce(JSON.stringify({ ipfsHash: expectedHash }));

    const result = await ipfsApi.uploadIPFSContent([ContentType.coverFreeText, coverFreeTextContent]);
    expect(result).toEqual(expectedHash);
  });

  it('should throw error if api call fails', async () => {
    fetchMock.mockRejectOnce(new Error('Network error'));

    const res = async () => {
      await ipfsApi.uploadIPFSContent([ContentType.coverFreeText, coverFreeTextContent]);
    };
    await expect(res).rejects.toThrow('Failed to upload data to IPFS');
  });
});
