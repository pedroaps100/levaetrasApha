import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
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
import { cn } from './lib/utils';
import { ThemeProvider } from './contexts/ThemeProvider';
import { NotificationProvider } from './contexts/NotificationContext';
import { useSidebar } from '@/hooks/useSidebar';
import { LoginPage } from './pages/auth/LoginPage';
import { Skeleton } from './components/ui/skeleton';
import { ClientLayout } from './pages/client/ClientLayout';
import { ClientDashboardPage } from './pages/client/ClientDashboardPage';
import { DriverLayout } from './pages/driver/DriverLayout';
import { DriverDashboardPage } from './pages/driver/DriverDashboardPage';
import { TransactionProvider } from './contexts/TransactionContext';

const AdminLayout: React.FC = () => {
  const { isCollapsed } = useSidebar();
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        <AppHeader />
        <main className="flex-1 bg-muted/40 p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to a 'not-authorized' page or back to login
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <NotificationProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <SidebarProvider>
              <Router>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />

                  {/* Admin Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route element={<AdminLayout />}>
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
                  </Route>

                  {/* Client Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['cliente']} />}>
                      <Route path="/cliente" element={<ClientLayout />}>
                          <Route index element={<ClientDashboardPage />} />
                      </Route>
                  </Route>

                  {/* Driver Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['entregador']} />}>
                      <Route path="/entregador" element={<DriverLayout />}>
                          <Route index element={<DriverDashboardPage />} />
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
    </AuthProvider>
  );
}

export default App;
