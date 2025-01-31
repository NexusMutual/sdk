import mockAxios from 'jest-mock-axios';

import { uploadIPFSContent } from './uploadIPFSContent';
import { ContentType, CoverFreeText } from '../types/ipfs';

describe('uploadIPFSContent', () => {
  const URL = 'https://api.test.io/upload/v2';
  const coverFreeTextContent: CoverFreeText = {
    version: '1.0',
    freeText: 'test',
  };

  beforeAll(() => {
    jest.mock('axios');
  });

  beforeEach(() => {
    mockAxios.reset();
  });

  it('should throw an error if content is empty', async () => {
    const res = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await uploadIPFSContent([ContentType.coverFreeText, undefined as any], URL);
    };
    expect(res).rejects.toThrow('Content cannot be empty');
  });

  it('should call the ipfs upload endpoint with the correct data', async () => {
    const expectedHash = 'QmZ4w2yH';
    mockAxios.post.mockResolvedValue({
      data: { ipfsHash: expectedHash },
    });

    await uploadIPFSContent([ContentType.coverFreeText, coverFreeTextContent], URL);

    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(mockAxios.post).toHaveBeenCalledWith(URL + '/ipfs', {
      type: ContentType.coverFreeText,
      content: coverFreeTextContent,
    });
  });

  it('should return the ipfs hash on successful upload', async () => {
    const expectedHash = 'QmZ4w2yH9oF';
    mockAxios.post.mockResolvedValue({
      data: { ipfsHash: expectedHash },
    });

    const result = await uploadIPFSContent([ContentType.coverFreeText, coverFreeTextContent], URL);
    expect(result).toEqual(expectedHash);
  });

  it('should throw error if api call fails', async () => {
    mockAxios.post.mockRejectedValue(new Error('Network error'));

    const res = async () => {
      await uploadIPFSContent([ContentType.coverFreeText, coverFreeTextContent], URL);
    };
    expect(res).rejects.toThrow('Failed to upload data to IPFS');
  });

  it('should throw error if nexusApiUrl is not provided', async () => {
    const res = async () => {
      await uploadIPFSContent([ContentType.coverFreeText, coverFreeTextContent], '');
    };
    expect(res).rejects.toThrow('IPFS base URL not set');
  });
});
