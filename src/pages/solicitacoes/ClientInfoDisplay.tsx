import React, { useMemo } from 'react';
import { Cliente } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Wallet, FileClock } from 'lucide-react';
import { useTransaction } from '@/contexts/TransactionContext';

interface ClientInfoDisplayProps {
    client: Cliente | null;
}

export const ClientInfoDisplay: React.FC<ClientInfoDisplayProps> = ({ client }) => {
    const { transactions } = useTransaction();

    const currentBalance = useMemo(() => {
        if (!client || client.modalidade !== 'pré-pago') {
            return 0;
        }
        // This is a simplified calculation. In a real scenario, you'd filter by client ID.
        // Since mock transactions don't have a client ID, we'll use a representative balance for now.
        const clientTransactions = transactions.filter(tx => tx.clientName === client.nome);
        
        if (clientTransactions.length > 0) {
            return clientTransactions.reduce((acc, tx) => {
                if (tx.type === 'credit') {
                    return acc + tx.value;
                }
                return acc - tx.value;
            }, 0);
        }
        // Return a default mock balance if no transactions are found for the specific client
        return 532.50; 

    }, [client, transactions]);

    if (!client) return null;

    const getFaturamentoDescricao = () => {
        if (!client.ativarFaturamentoAutomatico) return "Fechamento manual";
        switch (client.frequenciaFaturamento) {
          case 'diario': return "Diário";
          case 'semanal': return `Semanal (toda ${client.diaDaSemanaFaturamento})`;
          case 'mensal': return `Mensal (todo dia ${client.diaDoMesFaturamento})`;
          case 'por_entrega': return `A cada ${client.numeroDeEntregasParaFaturamento} entregas`;
          default: return "Não configurado";
        }
    };

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const isPrePago = client.modalidade === 'pré-pago';

    return (
        <div className="p-3 bg-muted/50 rounded-lg flex items-start gap-4">
            {isPrePago ? (
                <Wallet className="h-5 w-5 text-green-600 mt-1" />
            ) : (
                <FileClock className="h-5 w-5 text-blue-600 mt-1" />
            )}
            <div className="flex-1">
                <Badge variant={isPrePago ? 'secondary' : 'default'}>
                    {isPrePago ? 'Cliente Pré-pago' : 'Cliente Faturado'}
                </Badge>
                {isPrePago ? (
                    <p className="text-sm text-muted-foreground mt-1">
                        Saldo atual: <span className={`font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(currentBalance)}</span>
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                        Faturamento: <span className="font-medium text-foreground">{getFaturamentoDescricao()}</span>
                    </p>
                )}
            </div>
        </div>
    );
};
