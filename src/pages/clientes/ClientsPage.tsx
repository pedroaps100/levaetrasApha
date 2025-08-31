import React, { useState, useMemo } from 'react';
import { useClientsData } from '@/hooks/useClientsData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner";
import { PlusCircle, Search, Trash2, Pencil, Eye, Download, MoreHorizontal } from 'lucide-react';
import { ClientFormDialog } from '@/components/clients/ClientFormDialog';
import { Cliente } from '@/types';
import { ClientProfileModal } from '@/components/clients/profile/ClientProfileModal';
import { exportToPDF, exportToExcel } from '@/lib/exportUtils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const ClientsPage: React.FC = () => {
    const { clients, loading, addClient, updateClient, deleteClient } = useClientsData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Cliente | null>(null);
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');

    const handleOpenForm = (client: Cliente | null) => {
        setClientToEdit(client);
        setIsFormOpen(true);
    };

    const handleViewProfile = (client: Cliente) => {
        setSelectedClient(client);
        setIsProfileOpen(true);
    };

    const handleFormSubmit = (data: Omit<Cliente, 'id' | 'totalPedidos' | 'valorTotal'>) => {
        if (clientToEdit) {
            updateClient(clientToEdit.id, data);
            toast.success(`Cliente "${data.nome}" atualizado com sucesso!`);
        } else {
            addClient(data);
            toast.success(`Cliente "${data.nome}" adicionado com sucesso!`);
        }
        setIsFormOpen(false);
    };

    const handleDeleteClient = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            deleteClient(clientId);
            toast.success(`Cliente "${client.nome}" removido com sucesso!`);
        }
    };
    
    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const matchesSearch = client.nome.toLowerCase().includes(searchTerm.toLowerCase()) || client.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'todos' || client.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [clients, searchTerm, statusFilter]);

    const handleExportPDF = () => {
        const columns = [
            { header: 'Nome', dataKey: 'nome' },
            { header: 'Email', dataKey: 'email' },
            { header: 'Telefone', dataKey: 'telefone' },
            { header: 'Modalidade', dataKey: 'modalidade' },
            { header: 'Status', dataKey: 'status' },
        ];
        exportToPDF(columns, filteredClients, 'Relatório de Clientes', 'clientes');
    };

    const handleExportExcel = () => {
        const dataToExport = filteredClients.map(({ id, ...rest }) => rest);
        exportToExcel(dataToExport, 'clientes');
    };

    if (loading) {
        return <div className="p-6 text-center">Carregando clientes...</div>;
    }

    const renderClientActions = (client: Cliente) => (
        <>
            <Button variant="ghost" size="icon" onClick={() => handleViewProfile(client)}>
                <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleOpenForm(client)}>
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
                            Esta ação removerá permanentemente o cliente "{client.nome}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteClient(client.id)}>
                            Sim, remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
                <p className="text-muted-foreground">
                    Gerencie sua base de clientes e suas modalidades de pagamento.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative w-full md:flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar por nome ou email..." 
                                className="pl-8 w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos os Status</SelectItem>
                                <SelectItem value="ativo">Ativo</SelectItem>
                                <SelectItem value="inativo">Inativo</SelectItem>
                            </SelectContent>
                        </Select>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full md:w-auto gap-2"><Download className="h-4 w-4" />Exportar</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={handleExportPDF}>Exportar para PDF</DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportExcel}>Exportar para Excel</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button className="w-full md:w-auto gap-2" onClick={() => handleOpenForm(null)}>
                            <PlusCircle className="h-4 w-4" />
                            Adicionar Cliente
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Desktop View */}
                    <div className="hidden border rounded-lg md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Contato</TableHead>
                                    <TableHead className="text-center">Modalidade</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredClients.map(client => (
                                    <TableRow key={client.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.nome}`} />
                                                    <AvatarFallback>{client.nome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{client.nome}</p>
                                                    <p className="text-sm text-muted-foreground">{client.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{client.telefone}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={client.modalidade === 'faturado' ? 'default' : 'secondary'}>
                                                {client.modalidade === 'faturado' ? 'Faturado' : 'Pré-pago'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={client.status === 'ativo' ? 'outline' : 'destructive'} className={client.status === 'ativo' ? 'border-green-600 text-green-600' : ''}>
                                                {client.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {renderClientActions(client)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredClients.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">Nenhum cliente encontrado.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View */}
                    <div className="grid gap-4 md:hidden">
                        {filteredClients.map(client => (
                            <Card key={client.id} className="w-full">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.nome}`} />
                                                <AvatarFallback>{client.nome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                            <CardTitle className="text-base">{client.nome}</CardTitle>
                                        </div>
                                         <Badge variant={client.status === 'ativo' ? 'outline' : 'destructive'} className={client.status === 'ativo' ? 'border-green-600 text-green-600' : ''}>
                                            {client.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div><span className="font-medium text-muted-foreground">Email:</span> {client.email}</div>
                                    <div><span className="font-medium text-muted-foreground">Telefone:</span> {client.telefone}</div>
                                    <div className="flex items-center">
                                        <span className="font-medium text-muted-foreground mr-2">Modalidade:</span>
                                        <Badge variant={client.modalidade === 'faturado' ? 'default' : 'secondary'}>
                                            {client.modalidade === 'faturado' ? 'Faturado' : 'Pré-pago'}
                                        </Badge>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-1">
                                    {renderClientActions(client)}
                                </CardFooter>
                            </Card>
                        ))}
                         {filteredClients.length === 0 && (
                            <div className="text-center text-muted-foreground py-10">Nenhum cliente encontrado.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
            <ClientFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                clientToEdit={clientToEdit}
                onFormSubmit={handleFormSubmit}
            />
            <ClientProfileModal
                open={isProfileOpen}
                onOpenChange={setIsProfileOpen}
                client={selectedClient}
            />
        </div>
    );
};
