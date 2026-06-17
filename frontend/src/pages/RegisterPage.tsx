import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { guestStorageService } from '@/services/guestStorageService';
import { packingListService } from '@/services/packingListService';
import { pl } from '@/models/pl';
import { routes } from '@/models/constants';
import { usePageMeta } from '@/seo/usePageMeta';
import { Header } from '@/views/layout/Header';
import { PublicLayout } from '@/views/layout/PublicLayout';
import { Input } from '@/views/ui/Input';
import { Button } from '@/views/ui/Button';
import { isValidEmail, mapAuthError } from '@/utils/authErrors';

export function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [loading, setLoading] = useState(false);

  usePageMeta({
    title: pl.landing.seo.registerTitle,
    description: pl.landing.seo.registerDescription,
    path: routes.register,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setConfirmError('');
    setTermsError('');

    if (!isValidEmail(email)) {
      setEmailError(pl.auth.invalidEmail);
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError(pl.auth.passwordMismatch);
      return;
    }
    if (!acceptTerms) {
      setTermsError(pl.legal.termsRequired);
      return;
    }

    setLoading(true);
    try {
      await register(email, password, acceptTerms);

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

      navigate(routes.app);
    } catch (err) {
      const mapped = mapAuthError((err as Error).message);
      if (mapped.emailError) setEmailError(mapped.emailError);
      if (mapped.general === pl.auth.termsRequired || mapped.general === pl.legal.termsRequired) {
        setTermsError(pl.legal.termsRequired);
      } else if (mapped.general) {
        showToast(mapped.general, 'error');
      }
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
                if (confirmError) setConfirmError('');
              }}
              minLength={4}
              required
              error={confirmError}
            />
            <label className="flex items-start gap-3 text-sm text-navy cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (termsError) setTermsError('');
                }}
                className="mt-1 rounded border-border text-coral focus:ring-coral"
              />
              <span>
                {pl.legal.acceptTerms}{' '}
                <Link to={routes.terms} target="_blank" className="text-coral hover:underline">
                  {pl.legal.terms}
                </Link>
                ,{' '}
                <Link to={routes.privacy} target="_blank" className="text-coral hover:underline">
                  {pl.legal.privacy}
                </Link>{' '}
                {pl.legal.and}{' '}
                <Link to={routes.rodo} target="_blank" className="text-coral hover:underline">
                  {pl.legal.rodo}
                </Link>
              </span>
            </label>
            {termsError && <p className="text-sm text-red-500">{termsError}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? pl.common.loading : pl.auth.register}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted">
            {pl.auth.hasAccount}{' '}
            <Link to={routes.login} className="text-coral hover:underline">
              {pl.auth.login}
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
