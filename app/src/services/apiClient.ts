import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'pakownik_token';

function getDefaultApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  // Android emulator maps localhost to 10.0.2.2
  if (Platform.OS === 'android') return 'http://10.0.2.2:3001';
  return 'http://localhost:3001';
}

const API_URL = getDefaultApiUrl();

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

export class SessionExpiredError extends Error {
  constructor() {
    super('Sesja wygasła');
    this.name = 'SessionExpiredError';
  }
}

export function isSessionExpiredError(error: unknown): boolean {
  return error instanceof SessionExpiredError;
}

function isPublicAuthPath(path: string): boolean {
  return path.startsWith('/api/auth/login') || path.startsWith('/api/auth/register');
}

class ApiClient {
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  }

  async setToken(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  async clearToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = await this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });

    if (res.status === 204) return undefined as T;

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401 && token && !isPublicAuthPath(path)) {
        await this.clearToken();
        onUnauthorized?.();
        throw new SessionExpiredError();
      }
      throw new Error(data.error ?? 'Wystąpił błąd');
    }
    return data as T;
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
  }

  delete(path: string) {
    return this.request<void>(path, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
