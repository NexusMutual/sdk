import { CoverData } from './cover/Cover';
import { Ipfs } from './ipfs';
import { NexusSDKBase } from './nexus-sdk-base';
import { Quote } from './quote/Quote';
import { Swap } from './swap';
import { NexusSDKConfig } from './types/sdk';

/**
 * Main Nexus SDK class that provides access to all SDK functionality
 */
export class NexusSDK extends NexusSDKBase {
  public cover: CoverData;
  public quote: Quote;
  public swap: Swap;
  public ipfs: Ipfs;

  constructor(config: NexusSDKConfig = {}) {
    super(config);
    this.cover = new CoverData(config);
    this.swap = new Swap();
    this.ipfs = new Ipfs(config);
    this.quote = new Quote(config);
  }
}
