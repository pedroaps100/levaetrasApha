import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useTransaction } from '@/contexts/TransactionContext';

export const RechargesHistoryTab: React.FC = () => {
    const { transactions, loading } = useTransaction();

    const recharges = useMemo(() => {
        return transactions.filter(tx => tx.origin.startsWith('recharge_'));
    }, [transactions]);

    const getMethodFromOrigin = (origin: string) => {
        if (origin === 'recharge_pix') return 'Pix';
        if (origin === 'recharge_card') return 'Cartão de Crédito';
        if (origin === 'recharge_manual') return 'Crédito Manual';
        return 'Desconhecido';
    }

    if (loading) {
        return <div>Carregando recargas...</div>;
    }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Meio de Pagamento</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recharges.map(rec => (
            <TableRow key={rec.id}>
              <TableCell>{format(rec.date, 'dd/MM/yyyy')}</TableCell>
              <TableCell>
                <Badge variant="outline">{getMethodFromOrigin(rec.origin)}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-green-100 text-green-800 border-green-200">Concluída</Badge>
              </TableCell>
              <TableCell className="text-right font-medium text-green-600">
                + {rec.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </TableCell>
            </TableRow>
          ))}
          {recharges.length === 0 && (
            <TableRow>
                <TableCell colSpan={4} className="text-center h-24">Nenhuma recarga encontrada.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
