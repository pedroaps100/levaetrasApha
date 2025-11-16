import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cliente } from '@/types';
import { InfoTab } from './InfoTab';
import { RequestsHistoryTab } from './RequestsHistoryTab';
import { InvoicesTab } from './InvoicesTab';
import { PaymentsHistoryTab } from './PaymentsHistoryTab';
import { CancellationsTab } from './CancellationsTab';
import { AddressesTab } from './AddressesTab';
import { WalletTab } from './WalletTab';
import { RechargesHistoryTab } from './RechargesHistoryTab';
import { LivroCaixaTab } from './LivroCaixaTab';
import { AccessTab } from './AccessTab';
import { KeyRound } from 'lucide-react';

interface ClientProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Cliente | null;
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({ open, onOpenChange, client }) => {
  if (!client) return null;

  const isFaturado = client.modalidade === 'faturado';

  const content = (
    <Tabs defaultValue="info" className="flex flex-col h-full">
        <div className="w-full overflow-x-auto pb-2">
            <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex sm:grid-cols-9">
                <TabsTrigger value="info" className="flex-shrink-0">Informações</TabsTrigger>
                <TabsTrigger value="access" className="flex-shrink-0 flex items-center gap-1"><KeyRound className="h-4 w-4"/>Acesso</TabsTrigger>
                <TabsTrigger value="livro-caixa" className="flex-shrink-0">Livro Caixa</TabsTrigger>
                <TabsTrigger value="requests" className="flex-shrink-0">Solicitações</TabsTrigger>
                {isFaturado ? (
                    <>
                        <TabsTrigger value="invoices" className="flex-shrink-0">Faturas</TabsTrigger>
                        <TabsTrigger value="payments" className="flex-shrink-0">Pagamentos</TabsTrigger>
                    </>
                ) : (
                    <>
                        <TabsTrigger value="wallet" className="flex-shrink-0">Carteira</TabsTrigger>
                        <TabsTrigger value="recharges" className="flex-shrink-0">Recargas</TabsTrigger>
                    </>
                )}
                <TabsTrigger value="cancellations" className="flex-shrink-0">Cancelamentos</TabsTrigger>
                <TabsTrigger value="addresses" className="flex-shrink-0">Endereços</TabsTrigger>
            </TabsList>
        </div>
        <div className="flex-1 overflow-y-auto mt-4 pr-2">
            <TabsContent value="info"><InfoTab client={client} /></TabsContent>
            <TabsContent value="access"><AccessTab client={client} /></TabsContent>
            <TabsContent value="livro-caixa"><LivroCaixaTab /></TabsContent>
            <TabsContent value="requests"><RequestsHistoryTab /></TabsContent>
            {isFaturado ? (
                <>
                    <TabsContent value="invoices"><InvoicesTab /></TabsContent>
                    <TabsContent value="payments"><PaymentsHistoryTab /></TabsContent>
                </>
            ) : (
                <>
                    <TabsContent value="wallet"><WalletTab /></TabsContent>
                    <TabsContent value="recharges"><RechargesHistoryTab /></TabsContent>
                </>
            )}
            <TabsContent value="cancellations"><CancellationsTab /></TabsContent>
            <TabsContent value="addresses"><AddressesTab client={client} /></TabsContent>
        </div>
    </Tabs>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Perfil de {client.nome}</DialogTitle>
          <DialogDescription>
            Visualize todas as informações e históricos do cliente.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
            {content}
        </div>
      </DialogContent>
    </Dialog>
  );
};
