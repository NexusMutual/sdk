import { NexusSDKBase, RequestConfig } from '../nexus-sdk-base';
import {
  AuthSignature,
  EditCoverMetadataParams,
  ErrorApiResponse,
  EditCoverMetadataApiResponse,
  GetCoverApiResponse,
  GetCoverResponse,
  NexusSDKConfig,
  ViewCoverMetadataParams,
  ViewCoverMetadataApiResponse,
  ViewCoverMetadataResponse,
} from '../types';

export class CoverData extends NexusSDKBase {
  constructor(config: NexusSDKConfig = {}) {
    super(config);
  }

  public async getCover(coverId: number): Promise<GetCoverApiResponse | ErrorApiResponse> {
    if (!coverId || coverId <= 0) {
      return { result: undefined, error: { message: 'Invalid coverId: must be a positive number' } };
    }

    try {
      const response = await this.sendRequest<GetCoverResponse>(`/cover/${coverId}`);
      return { result: response, error: undefined };
    } catch (error: unknown) {
      return { result: undefined, error: { message: (error as Error).message || 'Failed to fetch cover' } };
    }
  }

  public async viewCoverMetadata(
    params: ViewCoverMetadataParams,
  ): Promise<ViewCoverMetadataApiResponse | ErrorApiResponse> {
    const { coverMetadataId, signature } = params;

    if (!coverMetadataId || typeof coverMetadataId !== 'string') {
      return { result: undefined, error: { message: 'Invalid coverMetadataId: must be a non-empty string' } };
    }

    const options: RequestConfig = { method: 'GET' };

    if (signature) {
      options.headers = this.buildAuthHeaders(signature);
    }

    try {
      const response = await this.sendRequest<ViewCoverMetadataResponse>(`/cover-metadata/${coverMetadataId}`, options);
      return { result: response, error: undefined };
    } catch (error: unknown) {
      return { result: undefined, error: { message: (error as Error).message || 'Failed to fetch cover metadata' } };
    }
  }

  public async editCoverMetadata(
    params: EditCoverMetadataParams,
  ): Promise<EditCoverMetadataApiResponse | ErrorApiResponse> {
    const { coverMetadataId, proofOfLoss, signature } = params;

    if (!coverMetadataId || typeof coverMetadataId !== 'string') {
      return { result: undefined, error: { message: 'Invalid coverMetadataId: must be a non-empty string' } };
    }

    if (!proofOfLoss || proofOfLoss.length === 0) {
      return { result: undefined, error: { message: 'At least one proof of loss entry is required' } };
    }

    if (!signature?.signature || !signature?.payload) {
      return { result: undefined, error: { message: 'Signature is required to edit cover metadata' } };
    }

    const options: RequestConfig = {
      method: 'PUT',
      headers: this.buildAuthHeaders(signature),
      data: { proofOfLoss },
    };

    try {
      const response = await this.sendRequest<{ success: boolean }>(`/cover-metadata/${coverMetadataId}`, options);
      return { result: response, error: undefined };
    } catch (error: unknown) {
      return { result: undefined, error: { message: (error as Error).message || 'Failed to update cover metadata' } };
    }
  }

  private buildAuthHeaders(auth: AuthSignature) {
    return {
      'x-auth-signature': auth.signature,
      'x-auth-payload': JSON.stringify(auth.payload, (_key, value) =>
        typeof value === 'bigint' ? String(value) : value,
      ),
    } as const;
  }
}
