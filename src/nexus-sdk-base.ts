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
    const requestOptions: AxiosRequestConfig = {};

    if (options.headers) {
      requestOptions.headers = options.headers;
    }
    if (options.params) {
      requestOptions.params = options.params;
    }

    try {
      let response: AxiosResponse<T>;
      if (!options.method || options.method.toUpperCase() === 'GET') {
        response = await axios.get<T>(url, requestOptions);
      } else if (options.method.toUpperCase() === 'POST') {
        response = await axios.post<T>(url, options.data, requestOptions);
      } else {
        // fallback for PUT, DELETE, etc.
        response = await axios.request<T>({
          url,
          ...options,
        });
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.error || error.response.statusText;
        if (!errorMessage.includes('Not enough capacity')) {
          throw new Error(`API request failed: ${error.response.status} ${errorMessage}`);
        }
      }
      throw error;
    }
  }
}
