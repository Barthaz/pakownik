import type { User } from '@/models/types';
import { apiClient } from './apiClient';

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  register(email: string, password: string, acceptTerms: boolean) {
    return apiClient.post<AuthResponse>('/api/auth/register', { email, password, acceptTerms });
  },

  login(email: string, password: string) {
    return apiClient.post<AuthResponse>('/api/auth/login', { email, password });
  },

  me() {
    return apiClient.get<User>('/api/auth/me');
  },

  saveToken(token: string) {
    return apiClient.setToken(token);
  },

  clearToken() {
    return apiClient.clearToken();
  },
};
