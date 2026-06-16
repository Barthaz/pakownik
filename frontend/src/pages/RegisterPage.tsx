import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { guestStorageService } from '@/services/guestStorageService';
import { packingListService } from '@/services/packingListService';
import { pl } from '@/models/pl';
import { Header } from '@/views/layout/Header';
import { PublicLayout } from '@/views/layout/PublicLayout';
import { Input } from '@/views/ui/Input';
import { Button } from '@/views/ui/Button';

export function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setConfirmError(pl.auth.passwordMismatch);
      return;
    }

    setConfirmError('');
    setLoading(true);
    try {
      await register(email, password);

      const guestList = guestStorageService.load();
      if (guestList.items.length > 0) {
        const list = await packingListService.create(guestList.name);
        for (const item of guestList.items) {
          await packingListService.createItem(list.id, {
            category: item.category,
            name: item.name,
            quantity: item.quantity,
          });
        }
        guestStorageService.clear();
        showToast('Konto utworzone — lista gościa została przeniesiona', 'success');
      } else {
        showToast('Konto utworzone pomyślnie', 'success');
      }

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
          <h1 className="text-2xl font-bold text-navy mb-6 text-center">{pl.auth.register}</h1>
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
              onChange={(e) => {
                setPassword(e.target.value);
                if (confirmError && e.target.value === confirmPassword) {
                  setConfirmError('');
                }
              }}
              minLength={4}
              required
            />
            <Input
              label={pl.auth.confirmPassword}
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmError) {
                  setConfirmError('');
                }
              }}
              minLength={4}
              required
              error={confirmError}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? pl.common.loading : pl.auth.register}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted">
            {pl.auth.hasAccount}{' '}
            <Link to="/login" className="text-coral hover:underline">
              {pl.auth.login}
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
