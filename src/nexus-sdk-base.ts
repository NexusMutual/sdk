import { NexusSDKConfig } from './types';

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly data: unknown;

  constructor(status: number, data: unknown, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

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
   * @param options Request configuration
   * @returns Promise resolving to the response data
   */
  protected async sendRequest<T>(endpoint: string, options: RequestConfig = {}): Promise<T> {
    const { method = 'GET', headers, params, data } = options;

    const url = new URL(this.apiUrl + endpoint);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value != null) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    const init: RequestInit = { method };
    if (data !== undefined) {
      init.body = JSON.stringify(data);
      init.headers = { 'Content-Type': 'application/json', ...headers };
    } else if (headers) {
      init.headers = headers;
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), init);
    } catch (err) {
      throw new ApiError(0, undefined, (err as Error).message ?? 'Network Error');
    }

    if (!response.ok) {
      const errorData = await this.parseResponseBody(response);
      const apiErrorMessage = (errorData as { error?: string })?.error || response.statusText || 'Unknown error';
      const message = apiErrorMessage.includes('Not enough capacity')
        ? apiErrorMessage
        : `API request failed: ${response.status} ${apiErrorMessage}`;
      throw new ApiError(response.status, errorData, message);
    }

    return (await this.parseResponseBody(response)) as T;
  }

  private async parseResponseBody(response: Response): Promise<unknown> {
    if (response.status === 204 || response.status === 205) {
      return undefined;
    }

    const text = await response.text();
    if (!text) {
      return undefined;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
}
