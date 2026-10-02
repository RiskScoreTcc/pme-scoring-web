export interface ApiErrorResponse {
  status: number;
  message: string;
  timestamp: string;
  error?: string;
  path?: string;
}