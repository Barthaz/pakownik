import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/views/ui/ToastContainer';
import { LandingPage } from '@/views/landing/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { GuestPage } from '@/pages/GuestPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ListDetailPage } from '@/pages/ListDetailPage';
import { FamilyPage } from '@/pages/FamilyPage';
import { SharedPage } from '@/pages/SharedPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/guest" element={<GuestPage />} />
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/app/lists/:id" element={<ListDetailPage />} />
            <Route path="/app/family" element={<FamilyPage />} />
            <Route path="/share/:shareId" element={<SharedPage />} />
          </Routes>
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
