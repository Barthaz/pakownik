import type { User } from '@/models/types';
import { apiClient } from './apiClient';

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(email: string, password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/api/auth/register', { email, password });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/api/auth/login', { email, password });
  },

  async me(): Promise<User> {
    return apiClient.get<User>('/api/auth/me');
  },

  saveToken(token: string) {
    localStorage.setItem('pakownik_token', token);
  },

  clearToken() {
    localStorage.removeItem('pakownik_token');
  },

  getToken(): string | null {
    return localStorage.getItem('pakownik_token');
  },
};
