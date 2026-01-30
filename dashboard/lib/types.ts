export interface User {
  email: string;
  balance: number;
  apiKey?: string | null;
}

export interface AuthResponse {
  token: string;
}

export interface ApiKeyResponse {
  key: string;
}

export interface ErrorResponse {
  error: string;
}
