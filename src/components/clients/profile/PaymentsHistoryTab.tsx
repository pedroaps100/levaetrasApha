import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { faker } from '@faker-js/faker';
import { format } from 'date-fns';

const mockPayments = Array.from({ length: 5 }, () => ({
  id: faker.string.uuid(),
  date: faker.date.past({ years: 0.5 }),
  invoiceId: `FAT-${faker.number.int({ min: 1000, max: 2000 })}`,
  method: faker.helpers.arrayElement(['Pix', 'Boleto', 'Transferência']),
  value: faker.number.float({ min: 100, max: 300, multipleOf: 0.1 }),
}));

export const PaymentsHistoryTab: React.FC = () => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Fatura</TableHead>
            <TableHead>Meio de Pagamento</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockPayments.map(pay => (
            <TableRow key={pay.id}>
              <TableCell>{format(pay.date, 'dd/MM/yyyy')}</TableCell>
              <TableCell>{pay.invoiceId}</TableCell>
              <TableCell>
                <Badge variant="outline">{pay.method}</Badge>
              </TableCell>
              <TableCell className="text-right">{pay.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
