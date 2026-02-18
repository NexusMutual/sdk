import * as deployments from '@nexusmutual/deployments';

import * as constants from './constants';
import * as ipfs from './ipfs';
import { NexusSDK } from './nexus-sdk';
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
  NexusSDK,
};

// Re-export everything from the deployments package (e.g. `addresses` and `abis`)
export * from '@nexusmutual/deployments';

export * from './product-api';

export * from './swap';

export * from './types';

export * from './ipfs';

export * from './quote';

export * from './constants';

export { NexusSDK } from './nexus-sdk';

export default nexusSdk;
