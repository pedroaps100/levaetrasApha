import { User, Cliente, Entregador, Cargo, Region, Bairro, PaymentMethod, FormaPagamentoConciliacao, TaxaExtra, Category } from '@/types';
import { ALL_PERMISSIONS } from '@/lib/permissions';
import { faker } from '@faker-js/faker';

// --- Base User Definitions ---
const adminUser: User = {
  id: 'admin-1',
  nome: 'Ricardo Martins',
  email: 'admin@levaetras.com',
  password: 'password123',
  role: 'admin',
  cargoId: 'admin-master',
  permissions: ALL_PERMISSIONS.map(p => p.id),
  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Ricardo+Martins`
};

const entregadorUser: User = {
  id: 'entregador-1',
  nome: 'Carlos Souza',
  email: 'entregador@levaetras.com',
  password: 'password123',
  role: 'entregador',
  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Carlos+Souza`
};

const clienteFaturadoUser: User = {
  id: 'cliente-1',
  nome: 'Padaria Pão Quente',
  email: 'cliente.faturado@levaetras.com',
  password: 'password123',
  role: 'cliente',
  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Padaria`
};

const clientePrePagoUser: User = {
  id: 'cliente-2',
  nome: 'Restaurante Sabor Divino',
  email: 'cliente.prepago@levaetras.com',
  password: 'password123',
  role: 'cliente',
  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Restaurante`
};

// --- Initial Users Array ---
export const initialUsers: User[] = [
  adminUser,
  entregadorUser,
  clienteFaturadoUser,
  clientePrePagoUser,
  { 
    id: 'admin-2', 
    nome: 'Ana Silva', 
    email: 'gerente@levaetras.com', 
    password: 'password123', 
    role: 'admin', 
    cargoId: 'gerente-logistica', 
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Ana+Silva` 
  },
];


// --- Corresponding Profiles (Synced with base users) ---
export const initialEntregadores: Entregador[] = [
  {
    id: entregadorUser.id,
    nome: entregadorUser.nome,
    documento: '55566677788',
    email: entregadorUser.email,
    telefone: '(11) 91234-5678',
    cidade: 'São Paulo',
    bairro: 'Vila Madalena',
    veiculo: 'Carro - Fiat Fiorino',
    status: 'ativo',
    tipoComissao: 'fixo',
    valorComissao: 7.5,
    avatar: entregadorUser.avatar,
  }
];

export const initialClients: Cliente[] = [
  {
    id: clienteFaturadoUser.id,
    nome: clienteFaturadoUser.nome,
    tipo: 'pessoa_juridica',
    email: clienteFaturadoUser.email,
    telefone: '(21) 98877-6655',
    endereco: 'Av. Atlântica, 1702',
    bairro: 'Copacabana',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    chavePix: 'padaria@email.com',
    status: 'ativo',
    totalPedidos: 58,
    valorTotal: 1250.70,
    modalidade: 'faturado',
    ativarFaturamentoAutomatico: true,
    frequenciaFaturamento: 'semanal',
    diaDaSemanaFaturamento: 'sexta',
  },
  {
    id: clientePrePagoUser.id,
    nome: clientePrePagoUser.nome,
    tipo: 'pessoa_juridica',
    email: clientePrePagoUser.email,
    telefone: '(21) 97766-5544',
    endereco: 'R. Conde de Bonfim, 444',
    bairro: 'Tijuca',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    chavePix: 'restaurante@email.com',
    status: 'ativo',
    totalPedidos: 120,
    valorTotal: 3420.00,
    modalidade: 'pré-pago',
  }
];

// --- Other Settings Data ---
export const initialCargos: Cargo[] = [
    {
        id: 'admin-master',
        name: 'Administrador Master',
        description: 'Acesso total a todas as funcionalidades do sistema.',
        permissions: ALL_PERMISSIONS.map(p => p.id),
    },
    {
        id: 'gerente-logistica',
        name: 'Gerente de Logística',
        description: 'Gerencia solicitações e entregadores, mas não tem acesso ao financeiro.',
        permissions: ['dashboard:view', 'solicitacoes:view', 'solicitacoes:create', 'solicitacoes:edit', 'solicitacoes:manage_status', 'clientes:view', 'entregadores:view', 'entregadores:create', 'entregadores:edit', 'entregas:view'],
    }
];

export const generateInitialRegions = (): Region[] => [
    { id: 'zona-sul', name: 'Zona Sul' },
    { id: 'zona-norte', name: 'Zona Norte' },
    { id: 'zona-oeste', name: 'Zona Oeste' },
    { id: 'zona-leste', name: 'Zona Leste' },
    { id: 'centro', name: 'Centro' },
];

export const generateInitialBairros = (): Bairro[] => [
  { id: faker.string.uuid(), nome: 'Copacabana', taxa: 7.00, regionId: 'zona-sul' },
  { id: faker.string.uuid(), nome: 'Ipanema', taxa: 8.50, regionId: 'zona-sul' },
  { id: faker.string.uuid(), nome: 'Tijuca', taxa: 6.00, regionId: 'zona-norte' },
  { id: faker.string.uuid(), nome: 'Barra da Tijuca', taxa: 12.00, regionId: 'zona-oeste' },
  { id: faker.string.uuid(), nome: 'Tatuapé', taxa: 9.00, regionId: 'zona-leste' },
  { id: faker.string.uuid(), nome: 'Sé', taxa: 5.00, regionId: 'centro' },
];

export const generateInitialPaymentMethods = (): PaymentMethod[] => [
    { id: faker.string.uuid(), name: 'Pix', enabled: true, description: 'Pagamentos instantâneos via Pix.' },
    { id: faker.string.uuid(), name: 'Cartão de Crédito', enabled: false, description: 'Visa, Mastercard, etc. (requer gateway).' },
    { id: faker.string.uuid(), name: 'Dinheiro na Entrega', enabled: true, description: 'Pagamento em espécie ao entregador.' },
];

export const generateInitialFormasPagamentoConciliacao = (): FormaPagamentoConciliacao[] => [
    { id: 'pix-levaetras', nome: 'PIX Leva e Trás', acaoFaturamento: 'NENHUMA' },
    { id: 'dinheiro-levaetras', nome: 'Dinheiro Leva e Trás', acaoFaturamento: 'NENHUMA' },
    { id: 'faturar-taxa', nome: 'Faturar Taxa (Pago pela Loja)', acaoFaturamento: 'GERAR_DEBITO_TAXA' },
    { id: 'repassar-valor', nome: 'Repassar Valor (Recebido pela Leva e Trás)', acaoFaturamento: 'GERAR_CREDITO_REPASSE' },
    { id: 'pix-loja', nome: 'PIX Loja (Resolvido)', acaoFaturamento: 'NENHUMA' },
];

export const generateInitialTaxasExtras = (): TaxaExtra[] => [
    { id: faker.string.uuid(), nome: 'Taxa de Espera', valor: 5.00 },
    { id: faker.string.uuid(), nome: 'Volume Extra', valor: 7.50 },
    { id: faker.string.uuid(), nome: 'Carga Frágil', valor: 10.00 },
];

export const generateInitialCategories = (): { receitas: Category[], despesas: Category[] } => ({
  receitas: [
    { id: faker.string.uuid(), name: 'Taxa de Entrega' },
    { id: faker.string.uuid(), name: 'Venda de Produtos' },
  ],
  despesas: [
    { id: faker.string.uuid(), name: 'Combustível' },
    { id: faker.string.uuid(), name: 'Manutenção' },
    { id: faker.string.uuid(), name: 'Alimentação' },
  ],
});
