import React from 'react';
import { Cliente } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InfoTabProps {
  client: Cliente;
}

const DetailItem: React.FC<{ label: string; value?: string | number | null; children?: React.ReactNode }> = ({ label, value, children }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    {children || <p className="text-base">{value || 'Não informado'}</p>}
  </div>
);

export const InfoTab: React.FC<InfoTabProps> = ({ client }) => {
  const getFaturamentoDescricao = () => {
    if (!client.ativarFaturamentoAutomatico) return "Fechamento manual";
    switch (client.frequenciaFaturamento) {
      case 'diario': return "Diário";
      case 'semanal': return `Semanal (toda ${client.diaDaSemanaFaturamento})`;
      case 'mensal': return `Mensal (todo dia ${client.diaDoMesFaturamento})`;
      case 'por_entrega': return `A cada ${client.numeroDeEntregasParaFaturamento} entregas`;
      default: return "Não configurado";
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Informações Cadastrais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <DetailItem label="Nome / Razão Social" value={client.nome} />
          <DetailItem label="Email" value={client.email} />
          <DetailItem label="Telefone" value={client.telefone} />
          <DetailItem label="Endereço Principal" value={`${client.endereco}, ${client.bairro}, ${client.cidade} - ${client.uf}`} />
          <DetailItem label="Chave Pix" value={client.chavePix} />
          <DetailItem label="Status">
            <Badge variant={client.status === 'ativo' ? 'outline' : 'destructive'} className={client.status === 'ativo' ? 'border-green-600 text-green-600' : ''}>
              {client.status === 'ativo' ? 'Ativo' : 'Inativo'}
            </Badge>
          </DetailItem>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Configuração Financeira</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <DetailItem label="Modalidade de Pagamento">
            <Badge variant={client.modalidade === 'faturado' ? 'default' : 'secondary'}>
              {client.modalidade === 'faturado' ? 'Faturado' : 'Pré-pago'}
            </Badge>
          </DetailItem>
          {client.modalidade === 'faturado' && (
            <DetailItem label="Fechamento de Fatura" value={getFaturamentoDescricao()} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
