import React from 'react';
import { SolicitacaoHistoricoItem, SolicitacaoAcao } from '@/types';
import { format } from 'date-fns';
import { FilePlus2, Check, X, Play, HandCoins, Ban } from 'lucide-react';

interface HistoricoSolicitacaoTabProps {
    historico: SolicitacaoHistoricoItem[];
}

const acaoConfig: Record<SolicitacaoAcao, { label: string; icon: React.ElementType }> = {
    criada: { label: 'Solicitação criada', icon: FilePlus2 },
    editada: { label: 'Solicitação editada', icon: FilePlus2 },
    aceita: { label: 'Solicitação aceita', icon: Check },
    rejeitada: { label: 'Solicitação rejeitada', icon: X },
    iniciada: { label: 'Corrida iniciada', icon: Play },
    conciliada: { label: 'Entrega conciliada', icon: HandCoins },
    cancelada: { label: 'Solicitação cancelada', icon: Ban },
};

export const HistoricoSolicitacaoTab: React.FC<HistoricoSolicitacaoTabProps> = ({ historico }) => {
    const safeHistorico = Array.isArray(historico) ? [...historico].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()) : [];

    return (
        <div>
            <div className="relative pl-8">
                {safeHistorico.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Nenhum histórico de ações para esta solicitação.</p>
                ) : (
                    safeHistorico.map((item, index) => {
                        const config = acaoConfig[item.acao];
                        if (!config) return null;

                        const { label, icon: Icon } = config;
                        const isLast = index === safeHistorico.length - 1;

                        return (
                            <div key={item.id} className="flex gap-x-3">
                                <div className="relative">
                                    {!isLast && (
                                        <div className="absolute left-1/2 top-5 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" aria-hidden="true" />
                                    )}
                                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                        <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" aria-hidden="true" />
                                    </div>
                                </div>
                                <div className="pb-8 flex-1">
                                    <p className="font-medium text-foreground">{label} por <span className="font-bold">{item.usuarioNome}</span></p>
                                    <p className="text-sm text-muted-foreground">{format(new Date(item.data), 'dd/MM/yyyy \'às\' HH:mm')}</p>
                                    {item.detalhes && (
                                        <p className="mt-1 text-sm text-muted-foreground italic">Motivo: "{item.detalhes}"</p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
