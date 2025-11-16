import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Entregador } from '@/types';
import { InfoTab } from './InfoTab';
import { AccessTab } from './AccessTab';
import { KeyRound, User, History, Wallet } from 'lucide-react';

interface EntregadorProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entregador: Entregador | null;
}

export const EntregadorProfileModal: React.FC<EntregadorProfileModalProps> = ({ open, onOpenChange, entregador }) => {
  if (!entregador) return null;

  const content = (
    <Tabs defaultValue="info" className="flex flex-col h-full">
        <div className="w-full overflow-x-auto pb-2">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-flex sm:grid-cols-4">
                <TabsTrigger value="info" className="flex-shrink-0 flex items-center gap-1"><User className="h-4 w-4"/>Informações</TabsTrigger>
                <TabsTrigger value="access" className="flex-shrink-0 flex items-center gap-1"><KeyRound className="h-4 w-4"/>Acesso</TabsTrigger>
                <TabsTrigger value="history" className="flex-shrink-0 flex items-center gap-1"><History className="h-4 w-4"/>Histórico</TabsTrigger>
                <TabsTrigger value="financial" className="flex-shrink-0 flex items-center gap-1"><Wallet className="h-4 w-4"/>Financeiro</TabsTrigger>
            </TabsList>
        </div>
        <div className="flex-1 overflow-y-auto mt-4 pr-2">
            <TabsContent value="info"><InfoTab entregador={entregador} /></TabsContent>
            <TabsContent value="access"><AccessTab entregador={entregador} /></TabsContent>
            <TabsContent value="history"><p className="text-center text-muted-foreground p-8">Histórico de entregas será implementado.</p></TabsContent>
            <TabsContent value="financial"><p className="text-center text-muted-foreground p-8">Detalhes financeiros do entregador serão implementados.</p></TabsContent>
        </div>
    </Tabs>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Perfil de {entregador.nome}</DialogTitle>
          <DialogDescription>
            Visualize todas as informações e históricos do entregador.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
            {content}
        </div>
      </DialogContent>
    </Dialog>
  );
};
