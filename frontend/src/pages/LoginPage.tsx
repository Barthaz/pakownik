import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { pl } from '@/models/pl';
import { routes } from '@/models/constants';
import { usePageMeta } from '@/seo/usePageMeta';
import { Header } from '@/views/layout/Header';
import { PublicLayout } from '@/views/layout/PublicLayout';
import { Input } from '@/views/ui/Input';
import { Button } from '@/views/ui/Button';
import { isValidEmail, mapAuthError } from '@/utils/authErrors';

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  usePageMeta({
    title: pl.landing.seo.loginTitle,
    description: pl.landing.seo.loginDescription,
    path: routes.login,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError(pl.auth.invalidEmail);
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError(pl.auth.invalidEmail);
      return;
    }
    if (!password) {
      setPasswordError(pl.auth.invalidCredentials);
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showToast('Zalogowano pomyślnie', 'success');
      navigate(routes.app);
    } catch (err) {
      const mapped = mapAuthError((err as Error).message);
      if (mapped.emailError) setEmailError(mapped.emailError);
      if (mapped.passwordError) setPasswordError(mapped.passwordError);
      if (mapped.general) showToast(mapped.general, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout header={<Header />}>
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-navy mb-6 text-center">{pl.auth.login}</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={pl.auth.email}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              error={emailError}
              required
            />
            <Input
              label={pl.auth.password}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              error={passwordError}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? pl.common.loading : pl.auth.login}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted">
            {pl.auth.noAccount}{' '}
            <Link to={routes.register} className="text-coral hover:underline">
              {pl.auth.register}
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
