import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner";
import { TaxaExtra } from '@/types';
import { useSettingsData } from '@/hooks/useSettingsData';
import { TaxaExtraFormDialog } from './TaxaExtraFormDialog';

export const TaxasExtrasTab = () => {
    const { taxasExtras, addTaxaExtra, updateTaxaExtra, deleteTaxaExtra } = useSettingsData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [taxaToEdit, setTaxaToEdit] = useState<TaxaExtra | null>(null);

    const handleOpenForm = (taxa: TaxaExtra | null) => {
        setTaxaToEdit(taxa);
        setIsFormOpen(true);
    };

    const handleFormSubmit = (data: Omit<TaxaExtra, 'id'>) => {
        if (taxaToEdit) {
            updateTaxaExtra(taxaToEdit.id, data);
            toast.success(`Taxa extra "${data.nome}" atualizada!`);
        } else {
            addTaxaExtra(data);
            toast.success(`Taxa extra "${data.nome}" criada!`);
        }
        setIsFormOpen(false);
    };

    const handleDelete = (taxa: TaxaExtra) => {
        deleteTaxaExtra(taxa.id);
        toast.success(`Taxa extra "${taxa.nome}" removida!`);
    };
    
    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const renderActions = (taxa: TaxaExtra) => (
        <div className="flex justify-end items-center">
            <Button variant="ghost" size="icon" onClick={() => handleOpenForm(taxa)}><Pencil className="h-4 w-4" /></Button>
            <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Deseja remover a taxa extra "{taxa.nome}"?</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(taxa)}>Remover</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <CardTitle>Taxas Extras</CardTitle>
                    <CardDescription>Gerencie as taxas extras que podem ser adicionadas durante a criação de uma solicitação.</CardDescription>
                </div>
                <Button onClick={() => handleOpenForm(null)} className="w-full md:w-auto mt-4 md:mt-0"><PlusCircle className="mr-2 h-4 w-4" /> Nova Taxa Extra</Button>
            </CardHeader>
            <CardContent>
                {/* Desktop View */}
                <div className="hidden lg:block border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {taxasExtras.map(taxa => (
                                <TableRow key={taxa.id}>
                                    <TableCell className="font-medium">{taxa.nome}</TableCell>
                                    <TableCell>{formatCurrency(taxa.valor)}</TableCell>
                                    <TableCell className="text-right">{renderActions(taxa)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 {/* Mobile/Tablet View */}
                 <div className="grid gap-4 lg:hidden">
                    {taxasExtras.map(taxa => (
                        <Card key={taxa.id}>
                            <CardHeader>
                                <CardTitle className="text-base">{taxa.nome}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-semibold">{formatCurrency(taxa.valor)}</p>
                            </CardContent>
                            <CardFooter>
                                {renderActions(taxa)}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </CardContent>
            <TaxaExtraFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                taxaToEdit={taxaToEdit}
                onFormSubmit={handleFormSubmit}
            />
        </Card>
    );
};
