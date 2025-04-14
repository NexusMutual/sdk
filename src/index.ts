import * as deployments from '@nexusmutual/deployments';

import * as cover from './cover';
import * as constants from './constants';
import * as ipfs from './ipfs';
import * as quote from './quote';
import * as swap from './swap';
import * as types from './types';
import productTypesData from '../generated/product-types.json';
import productsData from '../generated/products.json';
import * as generatedTypes from '../generated/types';
import { NexusSDK } from './nexus-sdk';

const nexusSdk = {
  ...deployments,
  products: productsData,
  productTypes: productTypesData,
  ...generatedTypes,
  ...swap,
  ...cover,
  ...types,
  ...quote,
  ...ipfs,
  ...constants,
  NexusSDK,
};

// Re-export everything from the deployments package (e.g. `addresses` and `abis`)
export * from '@nexusmutual/deployments';

// Export product data, so it will be included in the bundle
export { default as products } from '../generated/products.json';
export { default as productTypes } from '../generated/product-types.json';

// Export generated logo types
export * from '../generated/types';

export * from './swap';

export * from './cover';

export * from './types';

export * from './ipfs';

export * from './quote';

export * from './constants';

export { NexusSDK } from './nexus-sdk';

export default nexusSdk;
