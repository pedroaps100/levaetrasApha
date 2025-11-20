import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNotification } from '@/contexts/NotificationContext';
import { BellRing, Check, X } from 'lucide-react';

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

  const { requestPermission, permissionStatus } = useNotification();

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success("Configuração de notificação atualizada!");
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case 'granted':
        return <span className="flex items-center gap-1 text-green-600"><Check className="h-4 w-4" /> Ativadas</span>;
      case 'denied':
        return <span className="flex items-center gap-1 text-red-600"><X className="h-4 w-4" /> Bloqueadas</span>;
      default:
        return <span className="text-muted-foreground">Não solicitado</span>;
    }
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
            <Label className="font-medium">Notificações Push no Navegador</Label>
            <span className="text-sm text-muted-foreground">Receba alertas em tempo real sobre novas solicitações e atribuições.</span>
            <div className="text-sm pt-1">Status atual: {getPermissionStatusText()}</div>
          </div>
          <Button onClick={requestPermission} disabled={permissionStatus === 'denied'}>
            <BellRing className="mr-2 h-4 w-4" />
            {permissionStatus === 'granted' ? 'Revisar Permissão' : 'Ativar Notificações'}
          </Button>
        </div>
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
