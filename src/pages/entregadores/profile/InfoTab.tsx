import React from 'react';
import { Entregador } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InfoTabProps {
  entregador: Entregador;
}

const DetailItem: React.FC<{ label: string; value?: string | number | null; children?: React.ReactNode }> = ({ label, value, children }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    {children || <p className="text-base">{value || 'Não informado'}</p>}
  </div>
);

export const InfoTab: React.FC<InfoTabProps> = ({ entregador }) => {
  const formatComissao = (e: Entregador) => {
    if (typeof e.valorComissao !== 'number' || isNaN(e.valorComissao)) {
      return 'N/A';
    }
    if (e.tipoComissao === 'percentual') {
      return `${e.valorComissao}%`;
    }
    return e.valorComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Informações Cadastrais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <DetailItem label="Nome Completo" value={entregador.nome} />
          <DetailItem label="Documento (CPF/CNPJ)" value={entregador.documento} />
          <DetailItem label="Email" value={entregador.email} />
          <DetailItem label="Telefone" value={entregador.telefone} />
          <DetailItem label="Localização" value={`${entregador.bairro}, ${entregador.cidade}`} />
          <DetailItem label="Veículo" value={entregador.veiculo} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Configuração Financeira e Status</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <DetailItem label="Tipo de Comissão" value={entregador.tipoComissao === 'percentual' ? 'Percentual' : 'Valor Fixo'} />
          <DetailItem label="Valor da Comissão" value={formatComissao(entregador)} />
          <DetailItem label="Status">
            <Badge variant={entregador.status === 'ativo' ? 'outline' : 'destructive'} className={entregador.status === 'ativo' ? 'border-green-600 text-green-600' : ''}>
              {entregador.status === 'ativo' ? 'Ativo' : 'Inativo'}
            </Badge>
          </DetailItem>
        </CardContent>
      </Card>
    </div>
  );
};
