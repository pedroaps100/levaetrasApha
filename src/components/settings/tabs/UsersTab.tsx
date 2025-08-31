import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, Pencil } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner";
import { UserFormDialog } from './UserFormDialog';
import { User } from '@/types';
import { useSettingsData } from '@/hooks/useSettingsData';

export const UsersTab = () => {
    const { users, cargos, addUser, updateUser, deleteUser } = useSettingsData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const handleOpenForm = (user: User | null) => {
        setUserToEdit(user);
        setIsFormOpen(true);
    };

    const handleFormSubmit = (data: Omit<User, 'id' | 'avatar'>) => {
        if (userToEdit) {
            updateUser(userToEdit.id, data);
            toast.success(`Usuário "${data.nome}" atualizado com sucesso!`);
        } else {
            addUser(data);
            toast.success(`Usuário "${data.nome}" convidado com sucesso!`);
        }
        setIsFormOpen(false);
        setUserToEdit(null);
    };

    const handleDelete = (userId: string) => {
        const user = users.find(u => u.id === userId);
        deleteUser(userId);
        toast.success(`Usuário "${user?.nome}" removido com sucesso!`);
    };

    const renderUserActions = (user: User) => (
        <div className="flex justify-end items-center">
            <Button variant="ghost" size="icon" onClick={() => handleOpenForm(user)}>
                <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Essa ação não pode ser desfeita. Isso irá remover permanentemente o usuário
                        <span className="font-bold"> {user.nome}</span> do sistema.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(user.id)}>
                        Sim, remover usuário
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>Gerencie os membros da sua equipe e seus perfis de acesso.</CardDescription>
        </div>
        <Button onClick={() => handleOpenForm(null)} className="w-full md:w-auto mt-4 md:mt-0">
            <UserPlus className="mr-2 h-4 w-4" /> Convidar Usuário
        </Button>
      </CardHeader>
      <CardContent>
        {/* Desktop View */}
        <div className="hidden lg:block border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map(u => {
                        const cargo = u.role === 'admin' ? cargos.find(c => c.id === u.cargoId) : null;
                        return (
                            <TableRow key={u.id}>
                                <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                    <AvatarImage src={u.avatar} />
                                    <AvatarFallback>{u.nome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                    <p className="font-medium">{u.nome}</p>
                                    <p className="text-sm text-muted-foreground">{u.email}</p>
                                    </div>
                                </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{cargo ? cargo.name : u.role}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {renderUserActions(u)}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>

        {/* Mobile/Tablet View */}
        <div className="grid gap-4 lg:hidden">
            {users.map(u => {
                const cargo = u.role === 'admin' ? cargos.find(c => c.id === u.cargoId) : null;
                return (
                    <Card key={u.id}>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={u.avatar} />
                                    <AvatarFallback>{u.nome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-base">{u.nome}</CardTitle>
                                    <CardDescription>{u.email}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{cargo ? cargo.name : u.role}</Badge>
                        </CardContent>
                        <CardFooter>
                            {renderUserActions(u)}
                        </CardFooter>
                    </Card>
                )
            })}
        </div>

        <UserFormDialog 
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            userToEdit={userToEdit}
            onFormSubmit={handleFormSubmit}
        />
      </CardContent>
    </Card>
  );
};
