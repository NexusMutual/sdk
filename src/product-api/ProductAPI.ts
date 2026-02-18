import { NexusSDKBase } from '../nexus-sdk-base';
import { Product, ProductType } from '../types/product';
import { NexusSDKConfig } from '../types/sdk';

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
   * @returns Product type details
   */
  public async getProductTypeById(productTypeId: number): Promise<ProductType> {
    const productTypeEndpoint = `/product-types/${productTypeId}`;
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
  public async getProductById(productId: number): Promise<Product> {
    const productEndpoint = `/products/${productId}`;
    return this.sendRequest<Product>(productEndpoint);
  }

  /**
   * Get all products
   * @returns List of products
   */
  public async getAllProducts(): Promise<Product[]> {
    const productsEndpoint = '/products';
    return this.sendRequest<Product[]>(productsEndpoint);
  }
}
