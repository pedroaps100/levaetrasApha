import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, UserCircle, Building, Wallet, UserPlus, Plug, ShieldCheck, HandCoins, FilePlus2 } from 'lucide-react';
import { ProfileTab } from './tabs/ProfileTab';
import { SystemTab } from './tabs/SystemTab';
import { UsersTab } from './tabs/UsersTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { PaymentsTab } from './tabs/PaymentsTab';
import { IntegrationsTab } from './tabs/IntegrationsTab';
import { CargosTab } from './tabs/CargosTab';
import { FormasPagamentoConciliacaoTab } from './tabs/FormasPagamentoConciliacaoTab';
import { TaxasExtrasTab } from './tabs/TaxasExtrasTab';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta e do sistema.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <div className="w-full overflow-x-auto pb-2">
            <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-flex sm:grid-cols-9">
                <TabsTrigger value="profile" className="flex-shrink-0"><UserCircle className="mr-2 h-4 w-4"/>Perfil</TabsTrigger>
                <TabsTrigger value="system" className="flex-shrink-0"><Building className="mr-2 h-4 w-4"/>Sistema</TabsTrigger>
                <TabsTrigger value="users" className="flex-shrink-0"><UserPlus className="mr-2 h-4 w-4"/>Usuários</TabsTrigger>
                <TabsTrigger value="cargos" className="flex-shrink-0"><ShieldCheck className="mr-2 h-4 w-4"/>Cargos</TabsTrigger>
                <TabsTrigger value="notifications" className="flex-shrink-0"><Bell className="mr-2 h-4 w-4"/>Notificações</TabsTrigger>
                <TabsTrigger value="payments" className="flex-shrink-0"><Wallet className="mr-2 h-4 w-4"/>Pagamentos</TabsTrigger>
                <TabsTrigger value="conciliation-payments" className="flex-shrink-0"><HandCoins className="mr-2 h-4 w-4"/>Conciliação</TabsTrigger>
                <TabsTrigger value="taxas-extras" className="flex-shrink-0"><FilePlus2 className="mr-2 h-4 w-4"/>Taxas Extras</TabsTrigger>
                <TabsTrigger value="integrations" className="flex-shrink-0"><Plug className="mr-2 h-4 w-4"/>Integrações</TabsTrigger>
            </TabsList>
        </div>
        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="system">
          <SystemTab />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="cargos">
          <CargosTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsTab />
        </TabsContent>
        <TabsContent value="conciliation-payments">
          <FormasPagamentoConciliacaoTab />
        </TabsContent>
        <TabsContent value="taxas-extras">
          <TaxasExtrasTab />
        </TabsContent>
        <TabsContent value="integrations">
          <IntegrationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
