import React from 'react';
import { Cliente } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface AddressesTabProps {
  client: Cliente;
}

export const AddressesTab: React.FC<AddressesTabProps> = ({ client }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Endereços Salvos</CardTitle>
            <CardDescription>Gerencie os endereços de coleta e entrega do cliente.</CardDescription>
        </div>
        <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Endereço</Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4">
            <p className="font-medium">Endereço Principal</p>
            <p className="text-muted-foreground">{`${client.endereco}, ${client.bairro}, ${client.cidade} - ${client.uf}`}</p>
        </div>
        <div className="text-center text-muted-foreground p-8">
            Funcionalidade de múltiplos endereços será implementada.
        </div>
      </CardContent>
    </Card>
  );
};
