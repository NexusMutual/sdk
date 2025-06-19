import mockAxios from 'jest-mock-axios';

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

  beforeAll(() => {
    jest.mock('axios');
  });

  beforeEach(() => {
    mockAxios.reset();
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
    mockAxios.post.mockResolvedValue({
      data: { ipfsHash: expectedHash },
    });

    await ipfsApi.uploadIPFSContent([ContentType.coverFreeText, coverFreeTextContent]);

    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(mockAxios.post).toHaveBeenCalledWith(
      URL + '/ipfs',
      {
        type: ContentType.coverFreeText,
        content: coverFreeTextContent,
      },
      {
        params: { sdk: version },
      },
    );
  });

  it('should return the ipfs hash on successful upload', async () => {
    const expectedHash = 'QmZ4w2yH9oF';
    mockAxios.post.mockResolvedValue({
      data: { ipfsHash: expectedHash },
    });

    const result = await ipfsApi.uploadIPFSContent([ContentType.coverFreeText, coverFreeTextContent]);
    expect(result).toEqual(expectedHash);
  });

  it('should throw error if api call fails', async () => {
    mockAxios.post.mockRejectedValue(new Error('Network error'));

    const res = async () => {
      await ipfsApi.uploadIPFSContent([ContentType.coverFreeText, coverFreeTextContent]);
    };
    await expect(res).rejects.toThrow('Failed to upload data to IPFS');
  });
});
