import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/shared/ui/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { MapPage } from '@/pages/MapPage';
import { PropertyFormPage } from '@/pages/PropertyFormPage';
import { PropertyHistoryPage } from '@/pages/PropertyHistoryPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsManagingUnitsPage } from '@/pages/SettingsManagingUnitsPage';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRouter() {
  return (
    <Routes>
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
        <Route path="/configuracoes/unidades-gestoras" element={<SettingsManagingUnitsPage />} />
        <Route path="/historico" element={<PropertyHistoryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
