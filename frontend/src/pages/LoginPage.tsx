import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { pl } from '@/models/pl';
import { Header } from '@/views/layout/Header';
import { PublicLayout } from '@/views/layout/PublicLayout';
import { Input } from '@/views/ui/Input';
import { Button } from '@/views/ui/Button';

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast('Zalogowano pomyślnie', 'success');
      navigate('/app');
    } catch (err) {
      showToast((err as Error).message, 'error');
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
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label={pl.auth.password}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? pl.common.loading : pl.auth.login}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted">
            {pl.auth.noAccount}{' '}
            <Link to="/register" className="text-coral hover:underline">
              {pl.auth.register}
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
