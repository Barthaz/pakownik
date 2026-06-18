import type { User } from '@/models/types';
import { AUTH_TOKEN_KEY } from '@/models/constants';
import { apiClient } from './apiClient';
import { getStoredItem, removeStoredItem, setStoredItem } from './persistentStorage';

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(email: string, password: string, acceptTerms: boolean): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/api/auth/register', { email, password, acceptTerms });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/api/auth/login', { email, password });
  },

  async me(): Promise<User> {
    return apiClient.get<User>('/api/auth/me');
  },

  saveToken(token: string) {
    setStoredItem(AUTH_TOKEN_KEY, token);
  },

  clearToken() {
    removeStoredItem(AUTH_TOKEN_KEY);
  },

  getToken(): string | null {
    return getStoredItem(AUTH_TOKEN_KEY);
  },
};
