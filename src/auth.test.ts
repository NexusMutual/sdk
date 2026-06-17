import { buildAuthTypedData, buildCoverMetadataAuthMessage } from './auth';

describe('buildAuthTypedData', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns EIP-712 typed data with the provided message', () => {
    const now = 1700000000000;
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const result = buildAuthTypedData('hello world');

    expect(result.domain).toEqual({ name: 'Nexus Mutual App', version: '1.0.0' });
    expect(result.types).toEqual({
      Authentication: [
        { name: 'timestamp', type: 'uint256' },
        { name: 'message', type: 'string' },
      ],
    });
    expect(result.primaryType).toBe('Authentication');
    expect(result.value.message).toBe('hello world');
    expect(result.value.timestamp).toBe(BigInt(1700000000));
  });
});

describe('buildCoverMetadataAuthMessage', () => {
  it('returns the same structure as buildAuthTypedData', () => {
    const result = buildCoverMetadataAuthMessage();
    expect(result.domain).toEqual({ name: 'Nexus Mutual App', version: '1.0.0' });
    expect(result.primaryType).toBe('Authentication');
    expect(result.types.Authentication).toHaveLength(2);
  });
});
