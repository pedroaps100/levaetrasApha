import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner";
import { Cargo } from '@/types';
import { useSettingsData } from '@/hooks/useSettingsData';
import { CargoFormDialog } from './CargoFormDialog';
import { usePermissions } from '@/hooks/usePermissions';

export const CargosTab = () => {
    const { cargos, addCargo, updateCargo, deleteCargo } = useSettingsData();
    const { hasPermission } = usePermissions();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [cargoToEdit, setCargoToEdit] = useState<Cargo | null>(null);

    const handleOpenForm = (cargo: Cargo | null) => {
        setCargoToEdit(cargo);
        setIsFormOpen(true);
    };

    const handleFormSubmit = (data: Omit<Cargo, 'id'>) => {
        if (cargoToEdit) {
            updateCargo(cargoToEdit.id, data);
            toast.success(`Cargo "${data.name}" atualizado com sucesso!`);
        } else {
            addCargo(data);
            toast.success(`Cargo "${data.name}" criado com sucesso!`);
        }
        setIsFormOpen(false);
        setCargoToEdit(null);
    };

    const handleDelete = (cargoId: string) => {
        try {
            const cargo = cargos.find(c => c.id === cargoId);
            deleteCargo(cargoId);
            toast.success(`Cargo "${cargo?.name}" removido com sucesso!`);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const renderActions = (cargo: Cargo) => (
        <div className="flex justify-end items-center">
            {hasPermission('configuracoes:manage_cargos') && (
                <>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(cargo)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" disabled={cargo.id === 'admin-master'}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Essa ação não pode ser desfeita. Isso irá remover permanentemente o cargo
                                <span className="font-bold"> {cargo.name}</span>.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(cargo.id)}>
                                Sim, remover cargo
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}
        </div>
    );

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
            <CardTitle>Cargos e Permissões</CardTitle>
            <CardDescription>Crie e gerencie os cargos e suas respectivas permissões no sistema.</CardDescription>
        </div>
        {hasPermission('configuracoes:manage_cargos') && (
            <Button onClick={() => handleOpenForm(null)} className="w-full md:w-auto mt-4 md:mt-0">
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Cargo
            </Button>
        )}
      </CardHeader>
      <CardContent>
        {/* Desktop View */}
        <div className="hidden lg:block border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Permissões</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cargos.map(cargo => (
                    <TableRow key={cargo.id}>
                        <TableCell>
                            <div className="font-medium">{cargo.name}</div>
                            <div className="text-sm text-muted-foreground">{cargo.description}</div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="secondary">{cargo.permissions.length} permissões</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            {renderActions(cargo)}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        {/* Mobile/Tablet View */}
        <div className="grid gap-4 lg:hidden">
            {cargos.map(cargo => (
                <Card key={cargo.id}>
                    <CardHeader>
                        <CardTitle className="text-base">{cargo.name}</CardTitle>
                        <CardDescription>{cargo.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Badge variant="secondary">{cargo.permissions.length} permissões</Badge>
                    </CardContent>
                    <CardFooter>
                        {renderActions(cargo)}
                    </CardFooter>
                </Card>
            ))}
        </div>
      </CardContent>
      <CargoFormDialog 
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            cargoToEdit={cargoToEdit}
            onFormSubmit={handleFormSubmit}
        />
    </Card>
  );
};
