import React from 'react';
import { HistoricoItem, HistoricoAcao } from '@/types';
import { format } from 'date-fns';
import { FileText, Clock, Receipt, Send, CheckCircle2 } from 'lucide-react';

interface HistoricoAcoesTabProps {
    historico: HistoricoItem[];
}

const acaoConfig: Record<HistoricoAcao, { label: string; icon: React.ElementType }> = {
    criada: { label: 'Fatura criada', icon: FileText },
    fechada: { label: 'Fatura fechada', icon: Clock },
    pagamento_taxa: { label: 'Pagamento de taxa registrado', icon: Receipt },
    pagamento_repasse: { label: 'Repasse realizado', icon: Send },
    finalizada: { label: 'Fatura finalizada', icon: CheckCircle2 },
};

export const HistoricoAcoesTab: React.FC<HistoricoAcoesTabProps> = ({ historico }) => {
    const safeHistorico = Array.isArray(historico) ? historico : [];

    return (
        <div>
            <h3 className="font-semibold mb-4 text-base">Histórico de Ações</h3>
            <div className="relative pl-6">
                {safeHistorico.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum histórico de ações para esta fatura.</p>
                ) : (
                    safeHistorico.map((item, index) => {
                        const config = acaoConfig[item.acao];
                        if (!config) return null; // Safety check for unknown actions

                        const { label, icon: Icon } = config;
                        const isLast = index === safeHistorico.length - 1;

                        return (
                            <div key={item.id} className="flex gap-x-3">
                                <div className="relative">
                                    {!isLast && (
                                        <div className="absolute left-1/2 top-5 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" aria-hidden="true" />
                                    )}
                                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                                        <Icon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                                    </div>
                                </div>
                                <div className="pb-8">
                                    <p className="font-medium text-gray-900">{label}</p>
                                    <p className="text-sm text-gray-500">{format(item.data, 'dd/MM/yyyy \'às\' HH:mm')}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
