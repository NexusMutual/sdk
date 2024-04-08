export type ApiResponse<R, E> = {
  result: R;
  error: E;
};

export type ErrorResponse = {
  message: string;
  data: Record<string, any>;
};

export type ErrorApiResponse = ApiResponse<undefined, ErrorResponse>;
