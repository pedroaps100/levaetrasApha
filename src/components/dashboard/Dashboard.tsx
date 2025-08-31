import React from 'react';
import { 
  DollarSign, 
  FileText, 
  Truck, 
  TrendingUp,
  AlertTriangle,
  Clock,
  TrendingDown
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { RecentTransactions } from './RecentTransactions';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const { metrics, loading } = useDashboardData();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="p-6">
         <div className="h-8 w-1/2 bg-muted animate-pulse rounded-lg mb-2" />
         <div className="h-4 w-1/3 bg-muted animate-pulse rounded-lg mb-6" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="mt-6 h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!metrics) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const percentage = Math.round((metrics.entregas.hoje / metrics.entregas.media) * 100 - 100);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {user?.name?.split(' ')[0]}! Aqui está o resumo do dia.
        </p>
      </motion.div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          title="Contas a Pagar"
          value={formatCurrency(metrics.contasAPagar.valor)}
          subtitle={`${metrics.contasAPagar.atrasadas} atrasadas`}
          icon={DollarSign}
          subtitleIcon={AlertTriangle}
          subtitleColorClass="text-red-600"
        />

        <MetricCard
          title="Faturas Vencidas"
          value={formatCurrency(metrics.faturas.valor)}
          subtitle={`${metrics.faturas.vencidas} faturas`}
          icon={FileText}
          subtitleIcon={Clock}
          subtitleColorClass="text-red-600"
        />

        <MetricCard
          title="Entregas Hoje"
          value={String(metrics.entregas.hoje)}
          subtitle={`${Math.abs(percentage)}% vs. média diária (${metrics.entregas.media})`}
          icon={Truck}
          subtitleIcon={percentage >= 0 ? TrendingUp : TrendingDown}
          subtitleColorClass={percentage >= 0 ? 'text-green-600' : 'text-red-600'}
        />

        <MetricCard
          title="Taxas Recebidas"
          value={formatCurrency(metrics.taxas.valorLiquido)}
          subtitle={`${metrics.taxas.recebidas} entregas concluídas`}
          icon={DollarSign}
          subtitleIcon={TrendingUp}
          subtitleColorClass="text-green-600"
        />
        
        <MetricCard
          title="Novas Solicitações"
          value={String(metrics.solicitacoes.pendentes)}
          subtitle="aguardando análise"
          icon={Clock}
          subtitleIcon={AlertTriangle}
          subtitleColorClass="text-orange-500"
          className="sm:col-span-2 lg:col-span-3 xl:col-span-1"
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <RecentTransactions />
      </motion.div>
    </div>
  );
};
