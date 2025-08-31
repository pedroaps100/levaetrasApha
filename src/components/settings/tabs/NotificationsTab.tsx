import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface NotificationSettings {
  vencimentos: boolean;
  entregas: boolean;
  faturas: boolean;
  solicitacoes: boolean;
}

export const NotificationsTab = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    vencimentos: true,
    entregas: true,
    faturas: false,
    solicitacoes: true,
  });

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success("Configuração de notificação atualizada!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
        <CardDescription>Escolha como e quando você quer ser notificado.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="vencimentos" className="font-medium">Vencimentos de Contas</Label>
            <span className="text-sm text-muted-foreground">Receber alertas sobre contas a pagar próximas do vencimento.</span>
          </div>
          <Switch id="vencimentos" checked={settings.vencimentos} onCheckedChange={() => handleToggle('vencimentos')} />
        </div>
        <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="entregas" className="font-medium">Status de Entregas</Label>
            <span className="text-sm text-muted-foreground">Ser notificado sobre entregas concluídas ou canceladas.</span>
          </div>
          <Switch id="entregas" checked={settings.entregas} onCheckedChange={() => handleToggle('entregas')} />
        </div>
        <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="faturas" className="font-medium">Faturas Recebidas</Label>
            <span className="text-sm text-muted-foreground">Receber confirmação de pagamento de faturas.</span>
          </div>
          <Switch id="faturas" checked={settings.faturas} onCheckedChange={() => handleToggle('faturas')} />
        </div>
        <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="solicitacoes" className="font-medium">Novas Solicitações</Label>
            <span className="text-sm text-muted-foreground">Ser notificado quando um novo pedido ou solicitação chegar.</span>
          </div>
          <Switch id="solicitacoes" checked={settings.solicitacoes} onCheckedChange={() => handleToggle('solicitacoes')} />
        </div>
      </CardContent>
    </Card>
  );
};
