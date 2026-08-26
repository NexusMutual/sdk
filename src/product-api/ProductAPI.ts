import { NexusSDKBase } from '../nexus-sdk-base';
import { GetProductsOptions, Product, ProductType } from '../types/product';
import { NexusSDKConfig } from '../types/sdk';

const buildProductsQuery = ({ ids, filters }: GetProductsOptions): string => {
  const query = new URLSearchParams();

  if (ids?.length) {
    query.set('ids', ids.join(','));
  }

  for (const [key, value] of Object.entries(filters ?? {})) {
    if (Array.isArray(value)) {
      // A repeated key is a list to the API, while one comma-joined value would be a single filter value.
      value.forEach(entry => query.append(`filters[${key}][]`, String(entry)));
    } else if (value !== undefined) {
      query.set(`filters[${key}]`, String(value));
    }
  }

  return query.toString();
};

export class ProductAPI extends NexusSDKBase {
  /**
   * Create a new ProductAPI instance
   * @param config SDK configuration
   */
  constructor(config: NexusSDKConfig = {}) {
    super(config);
  }

  /**
   * Get product type details by ID
   * @param productTypeId ID of the product type
   * @param params Optional attributes to include
   * @returns Product type details
   */
  public async getProductTypeById(productTypeId: number, params?: string[]): Promise<ProductType> {
    const productTypeEndpoint = `/product-types/${productTypeId}${
      params ? `?${new URLSearchParams({ withAttributes: params.join(',') }).toString()}` : ''
    }`;
    return this.sendRequest<ProductType>(productTypeEndpoint);
  }

  /**
   * Get all product types
   * @returns List of product types
   */
  public async getAllProductTypes(): Promise<ProductType[]> {
    const productTypesEndpoint = '/product-types';
    return this.sendRequest<ProductType[]>(productTypesEndpoint);
  }

  /**
   * Get product details by ID
   * @param productId ID of the product
   * @returns Product details
   */
  public async getProductById(productId: number, params?: string[]): Promise<Product> {
    const productEndpoint = `/products/${productId}${
      params ? `?${new URLSearchParams({ withAttributes: params.join(',') }).toString()}` : ''
    }`;
    return this.sendRequest<Product>(productEndpoint);
  }

  /**
   * Get all products, optionally narrowed by filters or ids
   * @param options Product ids to look up, or filters to narrow the list. Ids take precedence over filters.
   * @returns List of products
   */
  public async getAllProducts(options: GetProductsOptions = {}): Promise<Product[]> {
    const query = buildProductsQuery(options);
    const productsEndpoint = `/products${query ? `?${query}` : ''}`;
    return this.sendRequest<Product[]>(productsEndpoint);
  }
}
