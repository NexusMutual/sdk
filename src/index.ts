import * as deployments from '@nexusmutual/deployments';

import * as buyCover from './buyCover';
import * as constants from './constants';
import * as ipfs from './ipfs';
import * as quote from './quote';
import * as swap from './swap';
import * as types from './types';
import productTypesData from '../generated/product-types.json';
import productsData from '../generated/products.json';
import * as generatedTypes from '../generated/types';

const nexusSdk = {
  ...deployments,
  products: productsData,
  productTypes: productTypesData,
  ...generatedTypes,
  ...swap,
  ...buyCover,
  ...types,
  ...quote,
  ...ipfs,
  ...constants,
};

// Re-export everything from the deployments package (e.g. `addresses` and `abis`)
export * from '@nexusmutual/deployments';

// Export product data, so it will be included in the bundle
export { default as products } from '../generated/products.json';
export { default as productTypes } from '../generated/product-types.json';

type ProductDTO = (typeof nexusSdk.products)[number];
export const productsMap = nexusSdk.products.reduce(
  (acc, product) => ({
    ...acc,
    [product.id]: product,
  }),
  {} as Record<number, ProductDTO>,
);

// Export generated logo types
export * from '../generated/types';

export * from './swap';

export * from './buyCover';

export * from './types';

export * from './quote';

export * from './constants';

export default nexusSdk;
