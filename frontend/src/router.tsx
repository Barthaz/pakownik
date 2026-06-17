import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/views/ui/ToastContainer';
import { routes } from '@/models/constants';
import { LandingPage } from '@/views/landing/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { GuestPage } from '@/pages/GuestPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ListDetailPage } from '@/pages/ListDetailPage';
import { FamilyPage } from '@/pages/FamilyPage';
import { TermsPage } from '@/pages/TermsPage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { RodoPage } from '@/pages/RodoPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path={routes.home} element={<LandingPage />} />
            <Route path={routes.login} element={<LoginPage />} />
            <Route path={routes.register} element={<RegisterPage />} />
            <Route path={routes.guest} element={<GuestPage />} />
            <Route path={routes.terms} element={<TermsPage />} />
            <Route path={routes.privacy} element={<PrivacyPolicyPage />} />
            <Route path={routes.rodo} element={<RodoPage />} />
            <Route path={routes.app} element={<DashboardPage />} />
            <Route path="/app/lists/:id" element={<ListDetailPage />} />
            <Route path="/app/family" element={<FamilyPage />} />
            <Route path="/login" element={<Navigate to={routes.login} replace />} />
            <Route path="/register" element={<Navigate to={routes.register} replace />} />
            <Route path="/guest" element={<Navigate to={routes.guest} replace />} />
          </Routes>
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
