export interface User {
  id: string;
  nome: string;
  email: string;
  password?: string;
  avatar?: string;
  role: 'admin' | 'entregador' | 'cliente';
  cargoId?: string;
  permissions?: string[];
}

export interface DashboardMetrics {
  contasAPagar: {
    total: number;
    atrasadas: number;
    valor: number;
  };
  faturas: {
    vencidas: number;
    valor: number;
    pendentes: number;
  };
  entregas: {
    hoje: number;
    media: number;
    emAndamento: number;
  };
  taxas: {
    recebidas: number;
    valorLiquido: number;
  };
  solicitacoes: {
    pendentes: number;
    emAnalise: number;
  };
}

export interface Cliente {
  id: string;
  nome: string;
  tipo: 'pessoa_fisica' | 'pessoa_juridica';
  email: string;
  telefone: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  chavePix?: string;
  status: 'ativo' | 'inativo';
  totalPedidos: number;
  valorTotal: number;
  modalidade: 'pré-pago' | 'faturado';
  // Faturamento
  ativarFaturamentoAutomatico?: boolean;
  frequenciaFaturamento?: 'diario' | 'semanal' | 'mensal' | 'por_entrega';
  numeroDeEntregasParaFaturamento?: number;
  diaDaSemanaFaturamento?: 'domingo' | 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado';
  diaDoMesFaturamento?: number;
}

export interface Entregador {
  id: string;
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  cidade: string;
  bairro: string;
  veiculo: string;
  status: 'ativo' | 'inativo';
  tipoComissao: 'percentual' | 'fixo';
  valorComissao: number;
  avatar?: string;
}

export interface Despesa {
  id: string;
  descricao: string;
  categoria: string;
  fornecedor: string;
  vencimento: Date;
  valor: number;
  status: 'Pendente' | 'Atrasado' | 'Pago';
}

export interface Receita {
    id: string;
    descricao: string;
    categoria: string;
    cliente: string;
    dataRecebimento: Date;
    valor: number;
}

export type FaturaStatusPagamento = 'Pendente' | 'Paga' | 'Vencida';
export type FaturaStatusRepasse = 'Pendente' | 'Repassado';
export type FaturaStatusGeral = 'Aberta' | 'Fechada' | 'Paga' | 'Finalizada' | 'Vencida';

export interface EntregaIncluida {
  id: string;
  data: Date;
  descricao: string;
  entregadorId?: string;
  entregadorNome?: string;
  taxaEntrega: number; // Valor original da taxa
  taxasExtras: { nome: string; valor: number }[];
  valorRepasse: number; // Valor original do repasse
  
  // Novos campos para controle financeiro preciso
  taxaFaturada?: number; // Valor que realmente entrou como débito na fatura
  repasseFaturado?: number; // Valor que realmente entrou como crédito na fatura
}

export type HistoricoAcao = 'criada' | 'fechada' | 'pagamento_taxa' | 'pagamento_repasse' | 'finalizada';

export interface HistoricoItem {
    id: string;
    acao: HistoricoAcao;
    data: Date;
    detalhes?: string;
}

export interface Fatura {
  id: string;
  numero: string;
  clienteId: string;
  clienteNome: string;
  tipoFaturamento: 'Mensal' | 'Semanal' | 'Diário' | 'Manual';
  totalEntregas: number;
  dataEmissao: Date;
  dataVencimento: Date;
  valorTaxas: number;
  statusTaxas: FaturaStatusPagamento;
  valorRepasse: number;
  statusRepasse: FaturaStatusRepasse;
  statusGeral: FaturaStatusGeral;
  observacoes?: string;
  entregas: EntregaIncluida[];
  historico: HistoricoItem[];
}

export interface TaxaExtra {
  id: string;
  nome: string;
  valor: number;
}

export interface Rota {
  id: string;
  bairroDestinoId: string;
  responsavel: string;
  telefone: string;
  observacoes?: string;
  receberDoCliente: boolean;
  valorExtra?: number;
  meiosPagamentoAceitos?: string[];
  taxaEntrega: number;
  status: 'pendente' | 'coletada' | 'entregue' | 'falhou';
  taxasExtrasIds?: string[];
}

export type SolicitacaoStatus = 'pendente' | 'aceita' | 'em_andamento' | 'concluida' | 'cancelada' | 'rejeitada';

export type OperationType = 'coleta' | 'entrega' | 'custom';

export interface PagamentoConciliado {
  id: string;
  valor: number;
  formaPagamentoId: string;
}

export interface RotaConciliacao {
  pagamentosTaxa: PagamentoConciliado[];
  pagamentosRepasse: PagamentoConciliado[];
}

export interface ConciliacaoData {
    [rotaId: string]: RotaConciliacao;
}

export type SolicitacaoAcao = 'criada' | 'editada' | 'aceita' | 'rejeitada' | 'iniciada' | 'conciliada' | 'cancelada';
export interface SolicitacaoHistoricoItem {
  id: string;
  data: Date;
  acao: SolicitacaoAcao;
  usuarioId: string;
  usuarioNome: string;
  detalhes?: string;
}

export interface Solicitacao {
  id: string;
  codigo: string;
  clienteId: string;
  clienteNome: string;
  clienteAvatar?: string;
  entregadorId?: string;
  entregadorNome?: string;
  entregadorAvatar?: string;
  status: SolicitacaoStatus;
  dataSolicitacao: Date;
  tipoOperacao: OperationType;
  operationDescription: string;
  pontoColeta: string;
  rotas: Rota[];
  valorTotalTaxas: number;
  valorTotalRepasse: number;
  valorTotalTaxasExtras?: number;
  justificativa?: string;
  conciliacao?: ConciliacaoData;
  historico?: SolicitacaoHistoricoItem[];
}


export interface Category {
  id: string;
  name: string;
}

export interface Region {
  id: string;
  name: string;
  // tax?: number; // Removido pois a taxa agora é por bairro
}

export interface Bairro {
  id: string;
  nome: string;
  taxa: number;
  regionId: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export type AcaoFaturamento = 'GERAR_DEBITO_TAXA' | 'GERAR_CREDITO_REPASSE' | 'NENHUMA';

export interface FormaPagamentoConciliacao {
    id: string;
    nome: string;
    acaoFaturamento: AcaoFaturamento;
}

export interface Cargo {
    id: string;
    name: string;
    description: string;
    permissions: string[];
}

export interface Transaction {
  id: string;
  date: Date;
  type: 'credit' | 'debit';
  origin: 'recharge_pix' | 'recharge_card' | 'recharge_manual' | 'delivery_fee' | 'cancellation_fee';
  description: string;
  value: number;
  relatedId?: string;
  clientName?: string;
  clientAvatar?: string;
}
