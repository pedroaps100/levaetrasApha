import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner";
import { PaymentMethod } from '@/types';
import { PaymentMethodFormDialog } from './PaymentMethodFormDialog';
import { useSettingsData } from '@/hooks/useSettingsData';

export const PaymentsTab = () => {
    const { paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, togglePaymentMethod } = useSettingsData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [methodToEdit, setMethodToEdit] = useState<PaymentMethod | null>(null);

    const handleOpenForm = (method: PaymentMethod | null) => {
        setMethodToEdit(method);
        setIsFormOpen(true);
    };

    const handleFormSubmit = (data: Omit<PaymentMethod, 'id' | 'enabled'>) => {
        if (methodToEdit) {
            updatePaymentMethod(methodToEdit.id, data);
            toast.success(`Meio de pagamento "${data.name}" atualizado!`);
        } else {
            addPaymentMethod(data);
            toast.success(`Meio de pagamento "${data.name}" adicionado!`);
        }
        setIsFormOpen(false);
    };

    const handleDelete = (method: PaymentMethod) => {
        deletePaymentMethod(method.id);
        toast.success(`Meio de pagamento "${method.name}" removido!`);
    };

    const handleToggle = (id: string) => {
        togglePaymentMethod(id);
        toast.success(`Status do meio de pagamento atualizado!`);
    };

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <CardTitle>Meios de Pagamento</CardTitle>
                    <CardDescription>Gerencie os meios de pagamento que você aceita em sua operação.</CardDescription>
                </div>
                <Button onClick={() => handleOpenForm(null)} className="w-full md:w-auto mt-4 md:mt-0"><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Meio</Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {paymentMethods.map(method => (
                        <div key={method.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4 rounded-md border p-4">
                            <div className="flex-1">
                                <p className="font-medium">{method.name}</p>
                                <p className="text-sm text-muted-foreground">{method.description}</p>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
                                <Switch
                                    id={`payment-${method.id}`}
                                    checked={method.enabled}
                                    onCheckedChange={() => handleToggle(method.id)}
                                />
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenForm(method)}><Pencil className="h-4 w-4" /></Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Deseja remover o meio de pagamento "{method.name}"?</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(method)}>Remover</AlertDialogAction></AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))}
                </div>
                <PaymentMethodFormDialog
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    methodToEdit={methodToEdit}
                    onFormSubmit={handleFormSubmit}
                />
            </CardContent>
        </Card>
    );
};
