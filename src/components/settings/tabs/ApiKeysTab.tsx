import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KeyRound, Trash2, Pencil } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner";
import { faker } from '@faker-js/faker';
import { ApiKey } from '@/types';
import { ApiKeyFormDialog } from './ApiKeyFormDialog';
import { DisplayApiKeyDialog } from './DisplayApiKeyDialog';
import { format } from 'date-fns';

const createNewApiKey = (name: string): ApiKey => {
    const rawKey = `sk_${faker.string.alphanumeric(32)}`;
    return {
        id: faker.string.uuid(),
        name,
        key: rawKey,
        displayKey: `${rawKey.substring(0, 5)}...${rawKey.substring(rawKey.length - 4)}`,
        createdAt: new Date(),
    };
};

const initialApiKeys: ApiKey[] = [
    createNewApiKey('API iFood'),
    createNewApiKey('API Rappi'),
];

export const ApiKeysTab = () => {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDisplayOpen, setIsDisplayOpen] = useState(false);
    const [keyToEdit, setKeyToEdit] = useState<ApiKey | null>(null);
    const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<ApiKey | null>(null);

    const handleOpenForm = (key: ApiKey | null) => {
        setKeyToEdit(key);
        setIsFormOpen(true);
    };

    const handleFormSubmit = (data: { name: string }) => {
        if (keyToEdit) {
            setApiKeys(prev => prev.map(k => k.id === keyToEdit.id ? { ...k, name: data.name } : k));
            toast.success(`Nome da chave API atualizado para "${data.name}"!`);
        } else {
            const newKey = createNewApiKey(data.name);
            setApiKeys(prev => [...prev, newKey]);
            setNewlyGeneratedKey(newKey);
            setIsDisplayOpen(true);
            toast.success(`Chave API "${data.name}" gerada com sucesso!`);
        }
        setIsFormOpen(false);
    };

    const handleRevokeKey = (key: ApiKey) => {
        setApiKeys(prev => prev.filter(k => k.id !== key.id));
        toast.success(`Chave API "${key.name}" revogada com sucesso!`);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Chaves de API</CardTitle>
                        <CardDescription>Gerencie suas chaves de API para integrações externas.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenForm(null)}>
                        <KeyRound className="mr-2 h-4 w-4" /> Gerar Nova Chave
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Chave</TableHead>
                                    <TableHead>Criada em</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {apiKeys.map(key => (
                                    <TableRow key={key.id}>
                                        <TableCell className="font-medium">{key.name}</TableCell>
                                        <TableCell>
                                            <code className="bg-muted px-2 py-1 rounded-md text-sm">{key.displayKey}</code>
                                        </TableCell>
                                        <TableCell>{format(key.createdAt, 'dd/MM/yyyy')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenForm(key)}><Pencil className="h-4 w-4" /></Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Revogar Chave API?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tem certeza de que deseja revogar a chave "{key.name}"? Qualquer integração usando esta chave deixará de funcionar. Esta ação não pode ser desfeita.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleRevokeKey(key)}>Sim, Revogar</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <ApiKeyFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                keyToEdit={keyToEdit}
                onFormSubmit={handleFormSubmit}
            />

            <DisplayApiKeyDialog
                open={isDisplayOpen}
                onOpenChange={setIsDisplayOpen}
                apiKey={newlyGeneratedKey}
            />
        </>
    );
};
