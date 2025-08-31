import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { faker } from '@faker-js/faker';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockOpenInvoices = Array.from({ length: 2 }, () => ({
  id: faker.string.uuid(),
  period: `01/07/2025 - ${format(faker.date.recent({ days: 5 }), 'dd/MM/yyyy')}`,
  deliveries: faker.number.int({ min: 5, max: 15 }),
  value: faker.number.float({ min: 50, max: 200, multipleOf: 0.1 }),
  dueDate: faker.date.future({ years: 0.1 }),
  status: faker.helpers.arrayElement(['aberta', 'vencida'] as const),
}));

const mockClosedInvoices = Array.from({ length: 5 }, () => ({
    id: faker.string.uuid(),
    period: `01/06/2025 - 30/06/2025`,
    value: faker.number.float({ min: 100, max: 300, multipleOf: 0.1 }),
    paymentDate: faker.date.past({ years: 0.1 }),
    status: 'paga' as const,
}));

const InvoiceTable: React.FC<{ invoices: any[], isOpen?: boolean }> = ({ invoices, isOpen = false }) => {
    const getStatusBadge = (status: string) => {
        switch (status) {
          case 'aberta': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Aberta</Badge>;
          case 'vencida': return <Badge variant="destructive">Vencida</Badge>;
          case 'paga': return <Badge className="bg-green-100 text-green-800 border-green-200">Paga</Badge>;
          default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Período</TableHead>
                    {isOpen && <TableHead>Nº Entregas</TableHead>}
                    {isOpen ? <TableHead>Vencimento</TableHead> : <TableHead>Data Pagamento</TableHead>}
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {invoices.map(inv => (
                    <TableRow key={inv.id}>
                        <TableCell>{inv.period}</TableCell>
                        {isOpen && <TableCell>{inv.deliveries}</TableCell>}
                        <TableCell>{format(isOpen ? inv.dueDate : inv.paymentDate, 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="text-center">{getStatusBadge(inv.status)}</TableCell>
                        <TableCell className="text-right">{inv.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon"><Download className="h-4 w-4"/></Button>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
    );
};


export const InvoicesTab: React.FC = () => {
  return (
    <Tabs defaultValue="open">
        <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="open">Faturas Abertas</TabsTrigger>
            <TabsTrigger value="closed">Faturas Fechadas</TabsTrigger>
        </TabsList>
        <TabsContent value="open">
            <InvoiceTable invoices={mockOpenInvoices} isOpen={true} />
        </TabsContent>
        <TabsContent value="closed">
            <InvoiceTable invoices={mockClosedInvoices} />
        </TabsContent>
    </Tabs>
  );
};
