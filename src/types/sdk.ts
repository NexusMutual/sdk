/**
 * Configuration options for the Nexus SDK
 */
export interface NexusSDKConfig {
  /**
   * Custom API URL. Defaults to 'https://api.nexusmutual.io/v2'
   */
  apiUrl?: string;
}

/**
 * Parameters for the getQuoteAndBuyCoverInputs function
 */
export interface GetQuoteAndBuyCoverInputsParams {
  /**
   * ID of the product to buy cover for
   */
  productId: number;

  /**
   * Amount of cover to buy, as a string
   */
  coverAmount: string;

  /**
   * Cover period in days
   */
  coverPeriod: number;

  /**
   * Asset to use for cover payment
   * Must be a valid CoverAsset enum value
   */
  coverAsset: number;

  /**
   * Address of the cover buyer
   * Must be a valid Ethereum address
   */
  coverBuyerAddress: string;

  /**
   * Optional slippage tolerance percentage
   * Value between 0-1 (defaults to 0.001 ~ 0.1%)
   */
  slippage?: number;

  /**
   * Optional IPFS CID string or content object to upload
   */
  ipfsCidOrContent?: string | Record<string, unknown>;
}
