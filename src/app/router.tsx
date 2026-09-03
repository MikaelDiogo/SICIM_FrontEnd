import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/shared/ui/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { MapPage } from '@/pages/MapPage';
import { PropertyFormPage } from '@/pages/PropertyFormPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { UsersPage } from '@/pages/UsersPage';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/mapa" element={<MapPage />} />
        <Route path="/imoveis/novo" element={<PropertyFormPage />} />
        <Route path="/imoveis/:id/editar" element={<PropertyFormPage />} />
        <Route path="/relatorios" element={<ReportsPage />} />
        <Route path="/usuarios" element={<UsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
