import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { PlusCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useTransaction } from '@/contexts/TransactionContext';
import { ManualCreditDialog } from './ManualCreditDialog';

export const WalletTab: React.FC = () => {
  const { transactions, loading } = useTransaction();
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  
  const currentBalance = useMemo(() => {
    return transactions.reduce((acc, tx) => {
        if (tx.type === 'credit') {
            return acc + tx.value;
        }
        return acc - tx.value;
    }, 0);
  }, [transactions]);

  if (loading) {
    return <div>Carregando extrato...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Saldo Atual</CardTitle>
                <p className={`text-3xl font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currentBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
            </div>
            <Button onClick={() => setIsCreditDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Crédito</Button>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>Extrato da Carteira</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <div className="hidden lg:block">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {transactions.map(tx => (
                            <TableRow key={tx.id}>
                                <TableCell>{format(tx.date, 'dd/MM/yyyy HH:mm')}</TableCell>
                                <TableCell className="flex items-center gap-2">
                                    {tx.type === 'credit' ? <ArrowUpCircle className="h-4 w-4 text-green-500" /> : <ArrowDownCircle className="h-4 w-4 text-red-500" />}
                                    {tx.description}
                                </TableCell>
                                <TableCell className={`text-right font-medium ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'credit' ? '+' : '-'} {tx.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="grid gap-4 lg:hidden">
                    {transactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between border-b p-3">
                            <div className="flex items-center gap-3">
                                {tx.type === 'credit' ? <ArrowUpCircle className="h-5 w-5 text-green-500" /> : <ArrowDownCircle className="h-5 w-5 text-red-500" />}
                                <div>
                                    <p className="font-medium">{tx.description}</p>
                                    <p className="text-sm text-muted-foreground">{format(tx.date, 'dd/MM/yy HH:mm')}</p>
                                </div>
                            </div>
                            <p className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.type === 'credit' ? '+' : '-'} {tx.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
      </Card>
      <ManualCreditDialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen} />
    </div>
  );
};
