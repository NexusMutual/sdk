import fetchMock from 'jest-fetch-mock';

import { ProductAPI } from './ProductAPI';
import { ProductCategoryEnum } from '../constants';

const API_URL = 'https://api.nexusmutual.io/v2';

const requestedUrl = () => {
  const [calledUrl] = fetchMock.mock.calls[0]!;
  return decodeURIComponent(String(calledUrl)).replace(/\+/g, ' ');
};

describe('ProductAPI.getAllProducts', () => {
  const productApi = new ProductAPI({ apiUrl: API_URL });

  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify([]));
  });

  it('requests the plain endpoint without options', async () => {
    await productApi.getAllProducts();

    expect(requestedUrl()).toBe(`${API_URL}/products`);
  });

  it('sends ids as a comma-separated list', async () => {
    await productApi.getAllProducts({ ids: [1, 6, 9] });

    expect(requestedUrl()).toBe(`${API_URL}/products?ids=1,6,9`);
  });

  it('sends each list filter as a repeated key', async () => {
    await productApi.getAllProducts({
      filters: { category: [ProductCategoryEnum.Dex, ProductCategoryEnum.Lending], productType: [2, 3] },
    });

    expect(requestedUrl()).toBe(
      `${API_URL}/products?filters[category][]=dex&filters[category][]=lending` +
        '&filters[productType][]=2&filters[productType][]=3',
    );
  });

  it('sends scalar filters as single keys', async () => {
    await productApi.getAllProducts({
      filters: { name: 'Aave v3', isPrivate: false, isDeprecated: true },
    });

    expect(requestedUrl()).toBe(
      `${API_URL}/products?filters[name]=Aave v3&filters[isPrivate]=false&filters[isDeprecated]=true`,
    );
  });

  it('omits empty ids and empty list filters', async () => {
    await productApi.getAllProducts({ ids: [], filters: { category: [], name: 'Aave' } });

    expect(requestedUrl()).toBe(`${API_URL}/products?filters[name]=Aave`);
  });

  it('returns the products from the response', async () => {
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify([{ id: 2, name: 'Aave v2', category: ProductCategoryEnum.Lending }]));

    const products = await productApi.getAllProducts({ ids: [2] });

    expect(products).toEqual([{ id: 2, name: 'Aave v2', category: 'lending' }]);
  });
});
