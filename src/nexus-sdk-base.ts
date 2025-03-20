import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { NexusSDKConfig } from './types';

/**
 * Base class for the Nexus SDK.
 * Handles configuration and provides common functionality for all SDK components.
 */
export class NexusSDKBase {
  protected apiUrl: string;

  /**
   * Create a new instance of NexusSDKBase
   * @param config SDK configuration
   */
  constructor(config: NexusSDKConfig = {}) {
    this.apiUrl = config.apiUrl ?? 'https://api.nexusmutual.io/v2';
  }

  /**
   * Sends an HTTP request to the specified endpoint
   * @param endpoint API endpoint to send the request to
   * @param options Axios request configuration
   * @returns Promise resolving to the response data
   */
  // TODO: validation if options is empty? empty options might lead to axios failing
  protected async sendRequest<T>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;

    try {
      const response: AxiosResponse<T> = await axios({
        url,
        ...options,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`API request failed: ${error.response.status} ${error.response.statusText}`);
      }
      throw error;
    }
  }
}
