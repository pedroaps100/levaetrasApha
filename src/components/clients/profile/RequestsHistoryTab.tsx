import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { faker } from '@faker-js/faker';
import { format } from 'date-fns';

const mockRequests = Array.from({ length: 10 }, () => ({
  id: faker.string.uuid(),
  date: faker.date.recent({ days: 30 }),
  origin: faker.location.streetAddress(false),
  destination: faker.location.streetAddress(false),
  value: faker.number.float({ min: 10, max: 50, multipleOf: 0.5 }),
  status: faker.helpers.arrayElement(['concluida', 'em_andamento', 'pendente'] as const),
}));

export const RequestsHistoryTab: React.FC = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluida': return <Badge className="bg-green-100 text-green-800 border-green-200">Concluída</Badge>;
      case 'em_andamento': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Em Andamento</Badge>;
      case 'pendente': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockRequests.map(req => (
            <TableRow key={req.id}>
              <TableCell>{format(req.date, 'dd/MM/yyyy HH:mm')}</TableCell>
              <TableCell>{req.origin}</TableCell>
              <TableCell>{req.destination}</TableCell>
              <TableCell className="text-center">{getStatusBadge(req.status)}</TableCell>
              <TableCell className="text-right">{req.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
