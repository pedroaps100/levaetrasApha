import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner";
import { PlusCircle, Search, Trash2, Pencil, Eye, Users, UserCheck, Truck, Clock } from 'lucide-react';
import { Entregador } from '@/types';
import { useEntregadoresData } from '@/hooks/useEntregadoresData';
import { EntregadorFormDialog } from './EntregadorFormDialog';
import { EntregadorProfileModal } from './profile/EntregadorProfileModal';

export const EntregadoresPage: React.FC = () => {
    const { entregadores, loading, addEntregador, updateEntregador, deleteEntregador } = useEntregadoresData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [entregadorToEdit, setEntregadorToEdit] = useState<Entregador | null>(null);
    const [selectedEntregador, setSelectedEntregador] = useState<Entregador | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');

    const handleOpenForm = (entregador: Entregador | null) => {
        setEntregadorToEdit(entregador);
        setIsFormOpen(true);
    };

    const handleViewProfile = (entregador: Entregador) => {
        setSelectedEntregador(entregador);
        setIsProfileOpen(true);
    };

    const handleFormSubmit = (data: Omit<Entregador, 'id' | 'avatar'>) => {
        if (entregadorToEdit) {
            updateEntregador(entregadorToEdit.id, data);
            toast.success(`Entregador "${data.nome}" atualizado com sucesso!`);
        } else {
            addEntregador(data);
            toast.success(`Entregador "${data.nome}" adicionado com sucesso!`);
        }
        setIsFormOpen(false);
    };

    const handleDeleteEntregador = (entregadorId: string) => {
        const entregador = entregadores.find(e => e.id === entregadorId);
        if (entregador) {
            deleteEntregador(entregadorId);
            toast.success(`Entregador "${entregador.nome}" removido com sucesso!`);
        }
    };
    
    const filteredEntregadores = useMemo(() => {
        return entregadores.filter(entregador => {
            const matchesSearch = entregador.nome.toLowerCase().includes(searchTerm.toLowerCase()) || entregador.documento.includes(searchTerm);
            const matchesStatus = statusFilter === 'todos' || entregador.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [entregadores, searchTerm, statusFilter]);

    const metrics = useMemo(() => ({
        total: entregadores.length,
        ativos: entregadores.filter(e => e.status === 'ativo').length,
        entregasHoje: 42, // Static for now
        horasTrabalhadas: 18, // Static for now
    }), [entregadores]);

    const formatComissao = (entregador: Entregador) => {
        if (typeof entregador.valorComissao !== 'number' || isNaN(entregador.valorComissao)) {
            return 'N/A';
        }

        if (entregador.tipoComissao === 'percentual') {
            return `${entregador.valorComissao}%`;
        }
        return entregador.valorComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    if (loading) {
        return <div className="p-6 text-center">Carregando entregadores...</div>;
    }

    const renderEntregadorActions = (entregador: Entregador) => (
        <>
            <Button variant="ghost" size="icon" onClick={() => handleViewProfile(entregador)}>
                <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleOpenForm(entregador)}>
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
                            Esta ação removerá permanentemente o entregador "{entregador.nome}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteEntregador(entregador.id)}>
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
                <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Entregadores</h1>
                <p className="text-muted-foreground">
                    Adicione, edite e gerencie os entregadores da sua equipe.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total de Entregadores</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.total}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Entregadores Ativos</CardTitle><UserCheck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.ativos}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Entregas Hoje</CardTitle><Truck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.entregasHoje}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total de Horas Trabalhadas</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.horasTrabalhadas}h</div></CardContent></Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative w-full md:flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar por nome ou documento..." className="pl-8 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent><SelectItem value="todos">Todos os Status</SelectItem><SelectItem value="ativo">Ativo</SelectItem><SelectItem value="inativo">Inativo</SelectItem></SelectContent>
                        </Select>
                        <Button className="w-full md:w-auto gap-2" onClick={() => handleOpenForm(null)}>
                            <PlusCircle className="h-4 w-4" />
                            Novo Entregador
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Desktop View */}
                    <div className="hidden border rounded-lg md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Localização</TableHead>
                                    <TableHead>Veículo</TableHead>
                                    <TableHead className="text-center">Comissão</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEntregadores.map(e => (
                                    <TableRow key={e.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar><AvatarImage src={e.avatar} /><AvatarFallback>{e.nome.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                                                <div><p className="font-medium">{e.nome}</p><p className="text-sm text-muted-foreground">DOC: {e.documento}</p></div>
                                            </div>
                                        </TableCell>
                                        <TableCell><div><p>{e.cidade}</p><p className="text-sm text-muted-foreground">{e.bairro}</p></div></TableCell>
                                        <TableCell>{e.veiculo}</TableCell>
                                        <TableCell className="text-center">{formatComissao(e)}</TableCell>
                                        <TableCell className="text-center"><Badge variant={e.status === 'ativo' ? 'outline' : 'destructive'} className={e.status === 'ativo' ? 'border-green-600 text-green-600' : ''}>{e.status === 'ativo' ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                                        <TableCell className="text-right">{renderEntregadorActions(e)}</TableCell>
                                    </TableRow>
                                ))}
                                {filteredEntregadores.length === 0 && <TableRow><TableCell colSpan={6} className="text-center h-24">Nenhum entregador encontrado.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View */}
                    <div className="grid gap-4 md:hidden">
                        {filteredEntregadores.map(e => (
                            <Card key={e.id} className="w-full">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar><AvatarImage src={e.avatar} /><AvatarFallback>{e.nome.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                                            <CardTitle className="text-base">{e.nome}</CardTitle>
                                        </div>
                                         <Badge variant={e.status === 'ativo' ? 'outline' : 'destructive'} className={e.status === 'ativo' ? 'border-green-600 text-green-600' : ''}>{e.status === 'ativo' ? 'Ativo' : 'Inativo'}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div><span className="font-medium text-muted-foreground">Documento:</span> {e.documento}</div>
                                    <div><span className="font-medium text-muted-foreground">Veículo:</span> {e.veiculo}</div>
                                    <div><span className="font-medium text-muted-foreground">Comissão:</span> {formatComissao(e)}</div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-1">{renderEntregadorActions(e)}</CardFooter>
                            </Card>
                        ))}
                         {filteredEntregadores.length === 0 && <div className="text-center text-muted-foreground py-10">Nenhum entregador encontrado.</div>}
                    </div>
                </CardContent>
            </Card>
            <EntregadorFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                entregadorToEdit={entregadorToEdit}
                onFormSubmit={handleFormSubmit}
            />
            <EntregadorProfileModal
                open={isProfileOpen}
                onOpenChange={setIsProfileOpen}
                entregador={selectedEntregador}
            />
        </div>
    );
};
