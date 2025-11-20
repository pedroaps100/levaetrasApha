import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { ClientsPage } from '@/pages/clientes/ClientsPage';
import { SolicitacoesPage } from '@/pages/solicitacoes/SolicitacoesPage';
import { EntregadoresPage } from '@/pages/entregadores/EntregadoresPage';
import { EntregasPage } from '@/pages/entregas/EntregasPage';
import { FaturasPage } from '@/pages/faturas/FaturasPage';
import { FaturasFinalizadasPage } from '@/pages/faturas/FaturasFinalizadasPage';
import { FinanceiroPage } from '@/pages/financeiro/FinanceiroPage';
import { RelatoriosPage } from '@/pages/relatorios/RelatoriosPage';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './contexts/ThemeProvider';
import { NotificationProvider } from './contexts/NotificationContext';
import { LoginPage } from './pages/auth/LoginPage';
import { Skeleton } from './components/ui/skeleton';
import { ClientDashboardPage } from './pages/client/ClientDashboardPage';
import { DriverDashboardPage } from './pages/driver/DriverDashboardPage';
import { TransactionProvider } from './contexts/TransactionContext';
import { FaturasProvider } from './contexts/FaturasContext';
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout';

// Placeholders for new routes
import ClientSolicitacoesPage from './pages/client/ClientSolicitacoesPage';
import ClientFinanceiroPage from './pages/client/ClientFinanceiroPage';
import ClientPerfilPage from './pages/client/ClientPerfilPage';
import DriverHistoricoPage from './pages/driver/DriverHistoricoPage';
import DriverFinanceiroPage from './pages/driver/DriverFinanceiroPage';
import DriverPerfilPage from './pages/driver/DriverPerfilPage';

const ProtectedRoute: React.FC<{ allowedRoles: string[] }> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <FaturasProvider>
        <TransactionProvider>
          <NotificationProvider>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
              <SidebarProvider>
                <Router>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    {/* Parent route for the main authenticated layout */}
                    <Route element={<AuthenticatedLayout />}>
                      {/* Admin Routes */}
                      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/solicitacoes" element={<SolicitacoesPage />} />
                        <Route path="/clientes" element={<ClientsPage />} />
                        <Route path="/entregadores" element={<EntregadoresPage />} />
                        <Route path="/entregas" element={<EntregasPage />} />
                        <Route path="/faturas" element={<FaturasPage />} />
                        <Route path="/faturas/finalizadas" element={<FaturasFinalizadasPage />} />
                        <Route path="/financeiro" element={<FinanceiroPage />} />
                        <Route path="/relatorios" element={<RelatoriosPage />} />
                        <Route path="/configuracoes" element={<SettingsPage />} />
                      </Route>

                      {/* Client Routes */}
                      <Route path="/cliente" element={<ProtectedRoute allowedRoles={['cliente']} />}>
                          <Route index element={<ClientDashboardPage />} />
                          <Route path="solicitacoes" element={<ClientSolicitacoesPage />} />
                          <Route path="financeiro" element={<ClientFinanceiroPage />} />
                          <Route path="perfil" element={<ClientPerfilPage />} />
                      </Route>

                      {/* Driver Routes */}
                      <Route path="/entregador" element={<ProtectedRoute allowedRoles={['entregador']} />}>
                          <Route index element={<DriverDashboardPage />} />
                          <Route path="historico" element={<DriverHistoricoPage />} />
                          <Route path="financeiro" element={<DriverFinanceiroPage />} />
                          <Route path="perfil" element={<DriverPerfilPage />} />
                      </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
                  <Toaster />
                </Router>
              </SidebarProvider>
            </ThemeProvider>
          </NotificationProvider>
        </TransactionProvider>
      </FaturasProvider>
    </AuthProvider>
  );
}

export default App;
