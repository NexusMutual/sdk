import { NexusSDK, ProductAPI } from '@nexusmutual/sdk';

export const sdk = new NexusSDK({ apiUrl: 'https://api.nexusmutual.io/v2' });
export const productAPI = new ProductAPI({ apiUrl: 'https://api.nexusmutual.io/v2' });
