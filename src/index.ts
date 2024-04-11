import * as deployments from '@nexusmutual/deployments';
import productsData from '../generated/products.json';
import productTypesData from '../generated/product-types.json';
import * as generatedTypes from '../generated/types';
import * as swap from './swap';
import * as buyCover from './buyCover';
import * as types from './types';
import * as quote from './quote';
import * as constants from './constants';

const nexusSdk = {
  ...deployments,
  products: productsData,
  productTypes: productTypesData,
  ...generatedTypes,
  ...swap,
  ...buyCover,
  ...types,
  ...quote,
  ...constants,
};

// Re-export everything from the deployments package (e.g. `addresses` and `abis`)
export * from '@nexusmutual/deployments';

// Export product data so it will be included in the bundle
export { default as products } from '../generated/products.json';
export { default as productTypes } from '../generated/product-types.json';

// Export generated logo types
export * from '../generated/types';

export * from './swap';

export * from './buyCover';

export * from './types';

export * from './quote';

export * from './constants';

export default nexusSdk;
