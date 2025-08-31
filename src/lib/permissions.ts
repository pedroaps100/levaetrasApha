export const PERMISSION_GROUPS = [
    {
        groupName: 'Dashboard',
        permissions: [
            { id: 'dashboard:view', label: 'Visualizar Dashboard' },
        ],
    },
    {
        groupName: 'Solicitações',
        permissions: [
            { id: 'solicitacoes:view', label: 'Visualizar Solicitações' },
            { id: 'solicitacoes:create', label: 'Criar Solicitações' },
            { id: 'solicitacoes:edit', label: 'Editar Solicitações' },
            { id: 'solicitacoes:delete', label: 'Excluir Solicitações' },
            { id: 'solicitacoes:manage_status', label: 'Gerenciar Status (Aceitar, Iniciar, etc.)' },
        ],
    },
    {
        groupName: 'Clientes',
        permissions: [
            { id: 'clientes:view', label: 'Visualizar Clientes' },
            { id: 'clientes:create', label: 'Criar Clientes' },
            { id: 'clientes:edit', label: 'Editar Clientes' },
            { id: 'clientes:delete', label: 'Excluir Clientes' },
        ],
    },
    {
        groupName: 'Entregadores',
        permissions: [
            { id: 'entregadores:view', label: 'Visualizar Entregadores' },
            { id: 'entregadores:create', label: 'Criar Entregadores' },
            { id: 'entregadores:edit', label: 'Editar Entregadores' },
            { id: 'entregadores:delete', label: 'Excluir Entregadores' },
        ],
    },
    {
        groupName: 'Entregas',
        permissions: [
            { id: 'entregas:view', label: 'Visualizar Entregas Concluídas' },
        ],
    },
    {
        groupName: 'Faturas',
        permissions: [
            { id: 'faturas:view', label: 'Visualizar Faturas' },
            { id: 'faturas:manage', label: 'Gerenciar Faturas (Lançar pagamentos, etc.)' },
        ],
    },
    {
        groupName: 'Financeiro',
        permissions: [
            { id: 'financeiro:view', label: 'Visualizar Financeiro' },
            { id: 'financeiro:manage_expenses', label: 'Gerenciar Despesas' },
            { id: 'financeiro:manage_revenues', label: 'Gerenciar Receitas' },
        ],
    },
    {
        groupName: 'Relatórios',
        permissions: [
            { id: 'relatorios:view', label: 'Visualizar Relatórios' },
        ],
    },
    {
        groupName: 'Configurações',
        permissions: [
            { id: 'configuracoes:view', label: 'Acessar Configurações' },
            { id: 'configuracoes:view_sistema', label: 'Ver Configurações do Sistema' },
            { id: 'configuracoes:manage_users', label: 'Gerenciar Usuários' },
            { id: 'configuracoes:manage_cargos', label: 'Gerenciar Cargos e Permissões' },
            { id: 'configuracoes:view_notifications', label: 'Ver Configurações de Notificação' },
            { id: 'configuracoes:view_payments', label: 'Ver Configurações de Pagamento' },
            { id: 'configuracoes:view_integrations', label: 'Ver Configurações de Integração' },
        ],
    },
];

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap(group => group.permissions);
