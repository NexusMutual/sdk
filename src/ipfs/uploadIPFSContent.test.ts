import mockAxios from 'jest-mock-axios';

import { uploadIPFSContent } from './uploadIPFSContent';
import { ContentType } from '../types/ipfs';

describe('uploadIPFSContent', () => {
  const URL = 'https://api.test.io/upload/v2/upload';

  beforeAll(() => {
    jest.mock('axios');
  });

  beforeEach(() => {
    mockAxios.reset();
  });

  it('should throw an error if content is empty', async () => {
    const res = async () => {
      // @ts-expect-error" Testing invalid input
      await uploadIPFSContent(URL, [ContentType.coverFreeText, undefined]);
    };
    expect(res).rejects.toThrow('Content cannot be empty');
  });

  it('should throw an error if content is invalid for coverValidators', async () => {
    const res = async () => {
      // @ts-expect-error" Testing invalid input
      await uploadIPFSContent(URL, [ContentType.coverValidators, { version: '1.0' }]);
    };
    expect(res).rejects.toThrow('Invalid content for coverValidators');
  });

  it('should throw an error if content is invalid for coverQuotaShare', async () => {
    const res = async () => {
      // @ts-expect-error" Testing invalid input
      await uploadIPFSContent(URL, [ContentType.coverQuotaShare, { version: '1.0' }]);
    };
    expect(res).rejects.toThrow('Invalid content for coverQuotaShare');
  });

  it('should throw an error if content is invalid for coverAumCoverAmountPercentage', async () => {
    const res = async () => {
      // @ts-expect-error" Testing invalid input
      await uploadIPFSContent(URL, [ContentType.coverAumCoverAmountPercentage, { version: '1.0' }]);
    };
    expect(res).rejects.toThrow('Invalid content for coverAumCoverAmountPercentage');
  });

  it('should throw an error if content is invalid for coverWalletAddress', async () => {
    const res = async () => {
      // @ts-expect-error" Testing invalid input
      await uploadIPFSContent(URL, [ContentType.coverWalletAddress, { version: '1.0' }]);
    };
    expect(res).rejects.toThrow('Invalid content for coverWalletAddress');
  });

  it('should throw an error if content is invalid for coverWalletAddresses - empty array', async () => {
    const res = async () => {
      await uploadIPFSContent(URL, [ContentType.coverWalletAddresses, { version: '1.0', walletAddresses: '' }]);
    };
    expect(res).rejects.toThrow('Wallet addresses cannot be empty');
  });

  it('should throw an error if content is invalid for coverWalletAddresses - no comma', async () => {
    const res = async () => {
      await uploadIPFSContent(URL, [
        ContentType.coverWalletAddresses,
        { version: '1.0', walletAddresses: '0x1234 0x32523' },
      ]);
    };
    expect(res).rejects.toThrow(
      'Invalid content for coverWalletAddresses. Wallet addresses should be separated by a comma',
    );
  });

  it('should throw an error if content is invalid for coverWalletAddresses - v2.0 empty array', async () => {
    const res = async () => {
      await uploadIPFSContent(URL, [ContentType.coverWalletAddresses, { version: '2.0', walletAddresses: [] }]);
    };
    expect(res).rejects.toThrow('Wallet addresses cannot be empty');
  });

  it('should throw an error if content is invalid for coverFreeText', async () => {
    const res = async () => {
      // @ts-expect-error" Testing invalid input
      await uploadIPFSContent(URL, [ContentType.coverFreeText, { version: '1.0' }]);
    };
    expect(res).rejects.toThrow('Invalid content for coverFreeText');
  });

  it('should throw an error if content is invalid for coverFreeText - empty string', async () => {
    const res = async () => {
      await uploadIPFSContent(URL, [ContentType.coverFreeText, { version: '1.0', freeText: '' }]);
    };
    expect(res).rejects.toThrow('Invalid content for coverFreeText');
  });

  it('should throw an error if content is invalid for coverFreeText - number', async () => {
    const res = async () => {
      // @ts-expect-error" Testing invalid input
      await uploadIPFSContent(URL, [ContentType.coverFreeText, { version: '1.0', freeText: 5 }]);
    };
    expect(res).rejects.toThrow('Free text should be a string');
  });

  it('should call the ipfs upload endpoint with the correct data', async () => {
    mockAxios.post.mockResolvedValue({
      data: {
        ipfsHash: 'QmZ4w2yH',
      },
    });

    await uploadIPFSContent(URL, [ContentType.coverFreeText, { version: '1.0', freeText: 'test' }]);

    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(mockAxios.post).toHaveBeenCalledWith(`${URL}?pin=true`, {
      type: ContentType.coverFreeText,
      content: {
        version: '1.0',
        freeText: 'test',
      },
    });
  });

  it('should return a hash if content is valid', async () => {
    mockAxios.post.mockResolvedValue({
      data: {
        ipfsHash: 'QmZ4w2yH9oF',
      },
    });

    const res = await uploadIPFSContent(URL, [ContentType.coverFreeText, { version: '1.0', freeText: 'test' }]);
    expect(res).toEqual('QmZ4w2yH9oF');
  });
});
