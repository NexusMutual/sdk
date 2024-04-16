export type ApiResponse<R, E> = {
  result: R;
  error: E;
};

export type ErrorResponse = {
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
};

export type ErrorApiResponse = ApiResponse<undefined, ErrorResponse>;
