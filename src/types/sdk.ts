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
  amount: string;

  /**
   * Cover period in days
   */
  period: number;

  /**
   * Asset to use for cover
   * Must be a valid CoverAsset enum value
   */
  coverAsset: number;

  /**
   * Address of the cover buyer
   * Must be a valid Ethereum address
   */
  buyerAddress: string;

  /**
   * ID of the cover to edit
   */
  coverId?: number;

  /**
   * Optional slippage tolerance percentage
   * Value between 0-1 (defaults to 0.001 ~ 0.1%)
   */
  slippage?: number;

  /**
   * Optional IPFS CID string or content object to upload
   */
  ipfsCidOrContent?: string | Record<string, unknown>;

  /**
   * Optional commission ratio
   */
  commissionRatio?: number;

  /**
   * Optional address of the commission receiver
   */
  commissionDestination?: string;

  /**
   * Asset to use for cover payment
   * Must be a valid PaymentAsset enum value
   */
  paymentAsset?: number;
}
