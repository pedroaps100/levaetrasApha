import React from 'react';
import { Solicitacao, SolicitacaoStatus } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSettingsData } from '@/hooks/useSettingsData';
import { Play, CheckCircle, MapPin, Phone, MessageSquare, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryCardProps {
    solicitacao: Solicitacao;
    onUpdateStatus: (id: string, newStatus: SolicitacaoStatus, details?: any) => void;
}

export const DeliveryCard: React.FC<DeliveryCardProps> = ({ solicitacao, onUpdateStatus }) => {
    const { bairros, paymentMethods } = useSettingsData();

    const handleStart = () => {
        onUpdateStatus(solicitacao.id, 'em_andamento');
        toast.success(`Corrida ${solicitacao.codigo} iniciada!`);
    };

    const handleComplete = () => {
        onUpdateStatus(solicitacao.id, 'concluida');
        toast.success(`Entrega ${solicitacao.codigo} concluída com sucesso!`);
    };
    
    const formatCurrency = (value: number | undefined) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{solicitacao.codigo}</CardTitle>
                        <CardDescription>{solicitacao.clienteNome}</CardDescription>
                    </div>
                    <Badge variant="outline">{solicitacao.operationDescription}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><MapPin className="h-4 w-4 text-red-500" /> Ponto de Coleta</h4>
                    <p className="text-sm text-muted-foreground">{solicitacao.pontoColeta}</p>
                </div>
                <Separator />
                <div>
                    <h4 className="font-semibold text-sm mb-2">Rotas de Entrega ({solicitacao.rotas.length})</h4>
                    <div className="space-y-3">
                        {solicitacao.rotas.map((rota, index) => {
                            const bairro = bairros.find(b => b.id === rota.bairroDestinoId);
                            return (
                                <div key={rota.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                                    <p className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-green-500" /> Rota #{index + 1}: {bairro?.nome}</p>
                                    <p className="text-sm flex items-center gap-2"><Phone className="h-4 w-4" /> {rota.responsavel} - {rota.telefone}</p>
                                    {rota.observacoes && <p className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4" /> {rota.observacoes}</p>}
                                    {rota.receberDoCliente && (
                                        <div className="pt-2 border-t mt-2 space-y-1">
                                            <p className="text-sm font-semibold text-primary flex items-center gap-2"><DollarSign className="h-4 w-4" /> Receber {formatCurrency(rota.valorAReceber)}</p>
                                            <div className="flex flex-wrap gap-1">
                                                <span className="text-xs text-muted-foreground">Meios:</span>
                                                {rota.meiosPagamentoAceitos?.map(id => {
                                                    const pm = paymentMethods.find(p => p.id === id);
                                                    return pm ? <Badge key={id} variant="secondary" className="text-xs">{pm.name}</Badge> : null;
                                                }) || <span className="text-xs">Nenhum</span>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                {solicitacao.status === 'aceita' && (
                    <Button className="w-full" onClick={handleStart}>
                        <Play className="mr-2 h-4 w-4" /> Iniciar Corrida
                    </Button>
                )}
                {solicitacao.status === 'em_andamento' && (
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleComplete}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Finalizar Entrega
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};
