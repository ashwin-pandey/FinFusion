import api from './api';
import { User, ApiResponse, AuthState } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

class AuthService {
  // Login with email and password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    if (response.data.success && response.data.data) {
      this.setTokens(response.data.data.tokens);
      return response.data.data;
    }
    throw new Error(response.data.error || 'Login failed');
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    if (response.data.success && response.data.data) {
      this.setTokens(response.data.data.tokens);
      return response.data.data;
    }
    throw new Error(response.data.error || 'Registration failed');
  }

  // Login with Google
  async loginWithGoogle(tokenId: string): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/google', { tokenId });
    if (response.data.success && response.data.data) {
      this.setTokens(response.data.data.tokens);
      return response.data.data;
    }
    throw new Error(response.data.error || 'Google login failed');
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get user');
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await api.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken });
    if (response.data.success && response.data.data) {
      this.setTokens(response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.error || 'Token refresh failed');
  }

  // Logout
  async logout(): Promise<void> {
    await api.post('/auth/logout');
    this.clearTokens();
  }

  // Token management
  setTokens(tokens: AuthTokens): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export default new AuthService();

