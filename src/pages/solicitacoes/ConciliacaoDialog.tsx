import React, { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Solicitacao, ConciliacaoData, PagamentoConciliado, FormaPagamentoConciliacao } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSettingsData } from '@/hooks/useSettingsData';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { Form, FormControl, FormItem, FormMessage } from '@/components/ui/form';

const parseCurrency = (value: string | number | undefined | null): number => {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value !== 'string' || value.trim() === '') {
        return 0;
    }
    // More robust parsing: removes R$, handles thousand separators, and converts comma to dot.
    const sanitized = value
        .replace("R$", "")
        .trim()
        .replace(/\./g, "")
        .replace(",", ".");
    const parsed = parseFloat(sanitized);
    return isNaN(parsed) ? 0 : parsed;
};

interface RotaConciliacaoFormProps {
    rota: Solicitacao['rotas'][0];
    bairroNome: string;
    control: any;
    index: number;
    formasPagamento: FormaPagamentoConciliacao[];
    watch: any;
}

const RotaConciliacaoForm: React.FC<RotaConciliacaoFormProps> = ({ rota, bairroNome, control, index, formasPagamento, watch }) => {
    const { fields: taxaFields, append: appendTaxa, remove: removeTaxa } = useFieldArray({ control, name: `rotas.${index}.pagamentosTaxa` });
    const { fields: repasseFields, append: appendRepasse, remove: removeRepasse } = useFieldArray({ control, name: `rotas.${index}.pagamentosRepasse` });

    const formatCurrency = (val: number | undefined) => (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const watchedTaxas = watch(`rotas.${index}.pagamentosTaxa`);
    const totalTaxaConciliada = useMemo(() => watchedTaxas?.reduce((sum: number, p: any) => sum + parseCurrency(p.valor), 0) || 0, [watchedTaxas]);
    const taxaRestante = rota.taxaEntrega - totalTaxaConciliada;

    const watchedRepasses = watch(`rotas.${index}.pagamentosRepasse`);
    const totalRepasseConciliado = useMemo(() => watchedRepasses?.reduce((sum: number, p: any) => sum + parseCurrency(p.valor), 0) || 0, [watchedRepasses]);
    const repasseRestante = (rota.valorExtra || 0) - totalRepasseConciliado;

    return (
        <div className="p-4 border rounded-lg space-y-4">
            <h4 className="font-semibold">Rota: {rota.responsavel} ({bairroNome})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="font-medium">Pagamento da Taxa ({formatCurrency(rota.taxaEntrega)})</Label>
                    <div className="space-y-2">
                        {taxaFields.map((field, pIndex) => (
                            <div key={field.id} className="flex items-end gap-2">
                                <Controller
                                    control={control}
                                    name={`rotas.${index}.pagamentosTaxa.${pIndex}.valor`}
                                    render={({ field }) => (
                                        <FormItem className="w-28">
                                            <Label className="text-xs">Valor</Label>
                                            <FormControl>
                                                <Input type="text" placeholder="10,00" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name={`rotas.${index}.pagamentosTaxa.${pIndex}.formaPagamentoId`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <Label className="text-xs">Forma</Label>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>{formasPagamento.map(fp => <SelectItem key={fp.id} value={fp.id}>{fp.nome}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-red-500" onClick={() => removeTaxa(pIndex)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => appendTaxa({ id: faker.string.uuid(), valor: taxaRestante > 0 ? taxaRestante.toFixed(2).replace('.', ',') : '0,00', formaPagamentoId: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Pagamento da Taxa</Button>
                    <div className={`text-sm font-medium p-2 rounded-md text-center ${Math.abs(taxaRestante) < 0.01 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        Valor Restante: {formatCurrency(taxaRestante)}
                    </div>
                </div>

                {(rota.valorExtra || 0) > 0 && (
                    <div className="space-y-2">
                        <Label className="font-medium">Pagamento do Repasse ({formatCurrency(rota.valorExtra)})</Label>
                        <div className="space-y-2">
                            {repasseFields.map((field, pIndex) => (
                                <div key={field.id} className="flex items-end gap-2">
                                     <Controller
                                        control={control}
                                        name={`rotas.${index}.pagamentosRepasse.${pIndex}.valor`}
                                        render={({ field }) => (
                                            <FormItem className="w-28">
                                                <Label className="text-xs">Valor</Label>
                                                <FormControl>
                                                    <Input type="text" placeholder="50,00" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Controller
                                        control={control}
                                        name={`rotas.${index}.pagamentosRepasse.${pIndex}.formaPagamentoId`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <Label className="text-xs">Forma</Label>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>{formasPagamento.map(fp => <SelectItem key={fp.id} value={fp.id}>{fp.nome}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-red-500" onClick={() => removeRepasse(pIndex)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => appendRepasse({ id: faker.string.uuid(), valor: repasseRestante > 0 ? repasseRestante.toFixed(2).replace('.', ',') : '0,00', formaPagamentoId: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Pagamento do Repasse</Button>
                         <div className={`text-sm font-medium p-2 rounded-md text-center ${Math.abs(repasseRestante) < 0.01 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            Valor Restante: {formatCurrency(repasseRestante)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ConciliacaoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    solicitacao: Solicitacao | null;
    onConfirm: (conciliacaoData: ConciliacaoData) => void;
}

export const ConciliacaoDialog: React.FC<ConciliacaoDialogProps> = ({ isOpen, onClose, solicitacao, onConfirm }) => {
    const { bairros, formasPagamentoConciliacao } = useSettingsData();
    
    const form = useForm({
        defaultValues: {
            rotas: [] as {
                pagamentosTaxa: PagamentoConciliado[];
                pagamentosRepasse: PagamentoConciliado[];
            }[]
        }
    });
    
    const { control, handleSubmit, watch, reset } = form;
    const watchedRotas = watch('rotas');

    useEffect(() => {
        if (solicitacao) {
            const defaultValues = {
                rotas: solicitacao.rotas.map(rota => {
                    const savedConciliacao = solicitacao.conciliacao?.[rota.id];
                    return {
                        pagamentosTaxa: savedConciliacao?.pagamentosTaxa.map(p => ({...p, valor: String(p.valor).replace('.',',')})) || [],
                        pagamentosRepasse: savedConciliacao?.pagamentosRepasse.map(p => ({...p, valor: String(p.valor).replace('.',',')})) || [],
                    };
                })
            };
            reset(defaultValues);
        }
    }, [solicitacao, isOpen, reset]);

    const isConciliacaoCompleta = useMemo(() => {
        if (!solicitacao || !watchedRotas || watchedRotas.length !== solicitacao.rotas.length) {
            return false;
        }
    
        return solicitacao.rotas.every((rota, index) => {
            const formRotaData = watchedRotas[index];
            if (!formRotaData) return false;
    
            const totalTaxaPago = (formRotaData.pagamentosTaxa || []).reduce((sum, p) => sum + parseCurrency(p.valor), 0);
            if (Math.abs(rota.taxaEntrega - totalTaxaPago) > 0.01) {
                return false;
            }
            for (const pagamento of formRotaData.pagamentosTaxa || []) {
                if (parseCurrency(pagamento.valor) > 0 && !pagamento.formaPagamentoId) {
                    return false;
                }
            }
    
            const totalRepassePago = (formRotaData.pagamentosRepasse || []).reduce((sum, p) => sum + parseCurrency(p.valor), 0);
            if (Math.abs((rota.valorExtra || 0) - totalRepassePago) > 0.01) {
                return false;
            }
            for (const pagamento of formRotaData.pagamentosRepasse || []) {
                if (parseCurrency(pagamento.valor) > 0 && !pagamento.formaPagamentoId) {
                    return false;
                }
            }
    
            return true;
        });
    }, [solicitacao, watchedRotas]);

    const onSubmit = (data: any) => {
        if (!solicitacao) return;
        const finalConciliacaoData = solicitacao.rotas.reduce((acc, rota, index) => {
            acc[rota.id] = {
                pagamentosTaxa: data.rotas[index].pagamentosTaxa.map((p: any) => ({...p, valor: parseCurrency(p.valor)})).filter((p: any) => p.valor > 0),
                pagamentosRepasse: data.rotas[index].pagamentosRepasse.map((p: any) => ({...p, valor: parseCurrency(p.valor)})).filter((p: any) => p.valor > 0),
            };
            return acc;
        }, {} as ConciliacaoData);
        onConfirm(finalConciliacaoData);
        onClose();
    };
    
    if (!solicitacao) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Conciliação da Solicitação {solicitacao.codigo}</DialogTitle>
                    <DialogDescription>
                        Confirme como os pagamentos de cada rota foram recebidos antes de finalizar.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="max-h-[60vh] overflow-y-auto p-1 pr-4 space-y-4">
                            {solicitacao.rotas.map((rota, index) => {
                                const bairro = bairros.find(b => b.id === rota.bairroDestinoId);
                                return (
                                    <RotaConciliacaoForm 
                                        key={rota.id} 
                                        rota={rota} 
                                        bairroNome={bairro?.nome || 'Não encontrado'}
                                        control={control}
                                        index={index}
                                        formasPagamento={formasPagamentoConciliacao}
                                        watch={watch}
                                    />
                                )
                            })}
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" disabled={!isConciliacaoCompleta}>Confirmar Conciliação e Finalizar</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
