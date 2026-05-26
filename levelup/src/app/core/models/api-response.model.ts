export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ErrorResponse {
  error: string;
  status: number;
  message: string;
}

export interface ValidationErrorResponse extends ErrorResponse {
  fields: Record<string, string>;
}
