import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner";
import { FormaPagamentoConciliacao, AcaoFaturamento } from '@/types';
import { useSettingsData } from '@/hooks/useSettingsData';
import { FormaPagamentoConciliacaoFormDialog } from './FormaPagamentoConciliacaoFormDialog';

export const FormasPagamentoConciliacaoTab = () => {
    const { formasPagamentoConciliacao, addFormaPagamentoConciliacao, updateFormaPagamentoConciliacao, deleteFormaPagamentoConciliacao } = useSettingsData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formaToEdit, setFormaToEdit] = useState<FormaPagamentoConciliacao | null>(null);

    const handleOpenForm = (forma: FormaPagamentoConciliacao | null) => {
        setFormaToEdit(forma);
        setIsFormOpen(true);
    };

    const handleFormSubmit = (data: Omit<FormaPagamentoConciliacao, 'id'>) => {
        if (formaToEdit) {
            updateFormaPagamentoConciliacao(formaToEdit.id, data);
            toast.success(`Forma de pagamento "${data.nome}" atualizada!`);
        } else {
            addFormaPagamentoConciliacao(data);
            toast.success(`Forma de pagamento "${data.nome}" criada!`);
        }
        setIsFormOpen(false);
    };

    const handleDelete = (forma: FormaPagamentoConciliacao) => {
        deleteFormaPagamentoConciliacao(forma.id);
        toast.success(`Forma de pagamento "${forma.nome}" removida!`);
    };

    const getAcaoLabel = (acao: AcaoFaturamento) => {
        switch (acao) {
            case 'GERAR_DEBITO_TAXA': return 'Gera Débito na Fatura';
            case 'GERAR_CREDITO_REPASSE': return 'Gera Crédito na Fatura';
            case 'NENHUMA': return 'Resolvido na Hora';
            default: return 'N/A';
        }
    };

    const renderActions = (forma: FormaPagamentoConciliacao) => (
        <div className="flex justify-end items-center">
            <Button variant="ghost" size="icon" onClick={() => handleOpenForm(forma)}><Pencil className="h-4 w-4" /></Button>
            <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Deseja remover a forma de pagamento "{forma.nome}"?</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(forma)}>Remover</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <CardTitle>Formas de Pagamento (Conciliação)</CardTitle>
                    <CardDescription>Gerencie as formas de pagamento usadas na conciliação das entregas e suas regras de faturamento.</CardDescription>
                </div>
                <Button onClick={() => handleOpenForm(null)} className="w-full md:w-auto mt-4 md:mt-0"><PlusCircle className="mr-2 h-4 w-4" /> Nova Forma de Pagamento</Button>
            </CardHeader>
            <CardContent>
                {/* Desktop View */}
                <div className="hidden lg:block border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Ação de Faturamento</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {formasPagamentoConciliacao.map(forma => (
                                <TableRow key={forma.id}>
                                    <TableCell className="font-medium">{forma.nome}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {getAcaoLabel(forma.acaoFaturamento)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{renderActions(forma)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 {/* Mobile/Tablet View */}
                 <div className="grid gap-4 lg:hidden">
                    {formasPagamentoConciliacao.map(forma => (
                        <Card key={forma.id}>
                            <CardHeader>
                                <CardTitle className="text-base">{forma.nome}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge variant="outline">
                                    {getAcaoLabel(forma.acaoFaturamento)}
                                </Badge>
                            </CardContent>
                            <CardFooter>
                                {renderActions(forma)}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </CardContent>
            <FormaPagamentoConciliacaoFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                formaToEdit={formaToEdit}
                onFormSubmit={handleFormSubmit}
            />
        </Card>
    );
};
