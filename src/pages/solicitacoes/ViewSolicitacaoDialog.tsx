import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Solicitacao } from '@/types';
import { Separator } from '@/components/ui/separator';
import { useSettingsData } from '@/hooks/useSettingsData';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, History, Download, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HistoricoSolicitacaoTab } from './HistoricoSolicitacaoTab';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ViewSolicitacaoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    solicitacao: Solicitacao | null;
}

const DetalhesTab: React.FC<{ solicitacao: Solicitacao }> = ({ solicitacao }) => {
    const { bairros, paymentMethods, taxasExtras } = useSettingsData();
    const formatCurrency = (value: number | undefined) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const totalAReceber = (solicitacao.valorTotalTaxas || 0) + (solicitacao.valorTotalRepasse || 0) + (solicitacao.valorTotalTaxasExtras || 0);

    return (
        <div className="space-y-4">
            {solicitacao.justificativa && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-yellow-800">
                                Motivo do Cancelamento/Rejeição:
                            </p>
                            <p className="mt-1 text-sm text-yellow-700">
                                {solicitacao.justificativa}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Tipo de Operação</p>
                <p className="font-semibold">{solicitacao.operationDescription}</p>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                <p>{solicitacao.clienteNome}</p>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                    {solicitacao.tipoOperacao === 'coleta' ? 'Ponto de Coleta' : 'Ponto de Entrega Final'}
                </p>
                <p>{solicitacao.pontoColeta}</p>
            </div>
            <Separator />
            <div>
                <h4 className="font-semibold mb-2">Rotas</h4>
                <div className="space-y-3">
                    {solicitacao.rotas.map((rota) => {
                        const bairro = bairros.find(b => b.id === rota.bairroDestinoId);
                        const taxasExtrasDaRota = taxasExtras.filter(te => rota.taxasExtrasIds?.includes(te.id));
                        const valorTaxasExtrasDaRota = taxasExtrasDaRota.reduce((sum, te) => sum + te.valor, 0);
                        const subtotalRota = (rota.taxaEntrega || 0) + (rota.valorExtra || 0) + valorTaxasExtrasDaRota;
                        return (
                            <div key={rota.id} className="p-3 border rounded-lg space-y-2">
                                <p className="font-semibold">Rota: {bairro?.nome}</p>
                                <p className="text-sm"><span className="text-muted-foreground">Responsável:</span> {rota.responsavel}</p>
                                <p className="text-sm"><span className="text-muted-foreground">Telefone:</span> {rota.telefone}</p>
                                {rota.observacoes && <p className="text-sm"><span className="text-muted-foreground">Observações:</span> {rota.observacoes}</p>}
                                <p className="text-sm"><span className="text-muted-foreground">Taxa:</span> {formatCurrency(rota.taxaEntrega)}</p>
                                
                                {taxasExtrasDaRota.length > 0 && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Taxas Extras:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {taxasExtrasDaRota.map(te => (
                                                <Badge key={te.id} variant="outline">{te.nome} ({formatCurrency(te.valor)})</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {rota.receberDoCliente && (
                                    <div className="pt-2 border-t mt-2">
                                        <p className="text-sm font-semibold text-primary">Receber do Cliente Final</p>
                                        <p className="text-sm"><span className="text-muted-foreground">Valor Extra (p/ Loja):</span> {formatCurrency(rota.valorExtra)}</p>
                                        <p className="text-sm font-semibold"><span className="text-muted-foreground">Subtotal Rota:</span> {formatCurrency(subtotalRota)}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            <span className="text-sm text-muted-foreground">Meios:</span>
                                            {rota.meiosPagamentoAceitos?.map(id => {
                                                const pm = paymentMethods.find(p => p.id === id);
                                                return pm ? <Badge key={id} variant="secondary">{pm.name}</Badge> : null;
                                            }) || <span className="text-sm">Nenhum</span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
             <Separator />
             <div className="space-y-2 pt-2">
                <div className="flex justify-between"><span>Total Taxas de Entrega:</span><span>{formatCurrency(solicitacao.valorTotalTaxas)}</span></div>
                {(solicitacao.valorTotalTaxasExtras || 0) > 0 && <div className="flex justify-between"><span>Total Taxas Extras:</span><span>{formatCurrency(solicitacao.valorTotalTaxasExtras)}</span></div>}
                <div className="flex justify-between"><span>Total Produtos (Repasse):</span><span>{formatCurrency(solicitacao.valorTotalRepasse)}</span></div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total a Receber do Cliente Final:</span><span>{formatCurrency(totalAReceber)}</span></div>
             </div>
        </div>
    );
}

export const ViewSolicitacaoDialog: React.FC<ViewSolicitacaoDialogProps> = ({ isOpen, onClose, solicitacao }) => {
    const { user } = useAuth();
    const contentRef = useRef<HTMLDivElement>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    
    if (!solicitacao) return null;

    const handleDownloadPDF = () => {
        const elementToCapture = contentRef.current;
        if (!elementToCapture) {
            toast.error("Não foi possível encontrar o conteúdo para gerar o PDF.");
            return;
        }

        setIsGeneratingPdf(true);

        const originalClassName = elementToCapture.className;
        const originalScrollTop = elementToCapture.scrollTop;

        elementToCapture.className = 'p-4 bg-background dark:bg-background'; 
        elementToCapture.scrollTop = 0;

        html2canvas(elementToCapture, {
            scale: 1, // Reduzido de 2 para 1 para diminuir o tamanho do arquivo
            useCORS: true,
            backgroundColor: window.getComputedStyle(document.body).backgroundColor,
            onclone: (clonedDoc) => {
                clonedDoc.documentElement.className = window.document.documentElement.className;
            }
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png', 0.92); // Adicionado leve compressão
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`solicitacao_${solicitacao.codigo}.pdf`);
        }).catch(err => {
            console.error("Erro ao gerar PDF:", err);
            toast.error("Ocorreu um erro ao gerar o PDF.");
        }).finally(() => {
            elementToCapture.className = originalClassName;
            elementToCapture.scrollTop = originalScrollTop;
            setIsGeneratingPdf(false);
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Detalhes da Solicitação {solicitacao.codigo}</DialogTitle>
                    <DialogDescription>
                        Visualização completa dos dados da solicitação.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto p-4" ref={contentRef}>
                    <Tabs defaultValue="detalhes">
                        <TabsList className={cn("grid w-full", user?.role === 'admin' ? "grid-cols-2" : "grid-cols-1")}>
                            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                            {user?.role === 'admin' && (
                                <TabsTrigger value="historico" className="flex items-center gap-2">
                                    <History className="h-4 w-4" /> Histórico
                                </TabsTrigger>
                            )}
                        </TabsList>
                        <TabsContent value="detalhes" className="mt-4">
                            <DetalhesTab solicitacao={solicitacao} />
                        </TabsContent>
                        {user?.role === 'admin' && (
                            <TabsContent value="historico" className="mt-4">
                                <HistoricoSolicitacaoTab historico={solicitacao.historico || []} />
                            </TabsContent>
                        )}
                    </Tabs>
                </div>
                <DialogFooter className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={handleDownloadPDF} disabled={isGeneratingPdf} className="w-full sm:w-auto">
                        {isGeneratingPdf ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        {isGeneratingPdf ? 'Gerando...' : 'Baixar PDF'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
