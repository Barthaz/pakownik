import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@/models/types';
import { authService } from '@/services/authService';
import { CONSENT_CHANGED_EVENT } from '@/services/cookieConsent';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, acceptTerms: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function restoreSession(
  setUser: (user: User | null) => void,
  setLoading: (loading: boolean) => void,
) {
  const token = authService.getToken();
  if (!token) {
    setUser(null);
    setLoading(false);
    return;
  }

  try {
    const me = await authService.me();
    setUser(me);
  } catch {
    authService.clearToken();
    setUser(null);
  } finally {
    setLoading(false);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void restoreSession(setUser, setLoading);

    const onConsentChanged = () => {
      setLoading(true);
      void restoreSession(setUser, setLoading);
    };

    window.addEventListener(CONSENT_CHANGED_EVENT, onConsentChanged);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onConsentChanged);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u, token } = await authService.login(email, password);
    authService.saveToken(token);
    setUser(u);
  }, []);

  const register = useCallback(async (email: string, password: string, acceptTerms: boolean) => {
    const { user: u, token } = await authService.register(email, password, acceptTerms);
    authService.saveToken(token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    authService.clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
