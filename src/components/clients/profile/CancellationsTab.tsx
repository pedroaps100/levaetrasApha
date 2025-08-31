import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { useTransaction } from '@/contexts/TransactionContext';

export const CancellationsTab: React.FC = () => {
    const { transactions, loading } = useTransaction();

    const cancellations = useMemo(() => {
        return transactions.filter(tx => tx.origin === 'cancellation_fee');
    }, [transactions]);

    if (loading) {
        return <div>Carregando cancelamentos...</div>;
    }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Valor da Taxa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cancellations.map(cancel => (
            <TableRow key={cancel.id}>
              <TableCell>{format(cancel.date, 'dd/MM/yyyy HH:mm')}</TableCell>
              <TableCell>{cancel.description}</TableCell>
              <TableCell className="text-right font-medium text-red-600">
                - {cancel.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </TableCell>
            </TableRow>
          ))}
          {cancellations.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center h-24">Nenhum cancelamento registrado.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
