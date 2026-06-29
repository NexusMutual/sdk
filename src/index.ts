import * as deployments from '@nexusmutual/deployments';

import * as auth from './auth';
import * as constants from './constants';
import * as cover from './cover';
import * as ipfs from './ipfs';
import { NexusSDK } from './nexus-sdk';
import { ApiError } from './nexus-sdk-base';
import * as productApi from './product-api';
import * as quote from './quote';
import * as swap from './swap';
import * as types from './types';

const nexusSdk = {
  ...deployments,
  ...swap,
  ...types,
  ...quote,
  ...ipfs,
  ...productApi,
  ...constants,
  ...cover,
  ...auth,
  NexusSDK,
  ApiError,
};

// Re-export everything from the deployments package (e.g. `addresses` and `abis`)
export * from '@nexusmutual/deployments';

export * from './product-api';

export * from './swap';

export * from './types';

export * from './ipfs';

export * from './quote';

export * from './cover';

export * from './auth';

export * from './constants';

export { NexusSDK } from './nexus-sdk';

export { ApiError } from './nexus-sdk-base';
export type { RequestConfig } from './nexus-sdk-base';

export default nexusSdk;
