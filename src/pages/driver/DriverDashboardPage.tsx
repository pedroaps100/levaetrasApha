import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSolicitacoesData } from '@/hooks/useSolicitacoesData';
import { DeliveryCard } from './components/DeliveryCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, CheckCircle } from 'lucide-react';

export const DriverDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { solicitacoes, updateStatusSolicitacao } = useSolicitacoesData();

    const myTasks = useMemo(() => {
        const assigned = solicitacoes.filter(s => s.entregadorId === user?.id);
        return {
            todo: assigned.filter(s => s.status === 'aceita'),
            inProgress: assigned.filter(s => s.status === 'em_andamento'),
        };
    }, [solicitacoes, user]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Minhas Entregas</h1>
                <p className="text-muted-foreground">
                    Aqui estão suas tarefas de entrega para hoje.
                </p>
            </div>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Truck className="h-6 w-6 text-primary" />
                        Para Fazer ({myTasks.todo.length})
                    </h2>
                    {myTasks.todo.length > 0 ? (
                        <div className="grid gap-4">
                            {myTasks.todo.map(task => (
                                <DeliveryCard key={task.id} solicitacao={task} onUpdateStatus={updateStatusSolicitacao} />
                            ))}
                        </div>
                    ) : (
                        <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                            <CardHeader>
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <CardTitle className="mt-4">Tudo em dia!</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Você não tem nenhuma entrega pendente no momento.</p>
                            </CardContent>
                        </Card>
                    )}
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Truck className="h-6 w-6 text-indigo-500 animate-pulse" />
                        Em Andamento ({myTasks.inProgress.length})
                    </h2>
                    {myTasks.inProgress.length > 0 ? (
                        <div className="grid gap-4">
                            {myTasks.inProgress.map(task => (
                                <DeliveryCard key={task.id} solicitacao={task} onUpdateStatus={updateStatusSolicitacao} />
                            ))}
                        </div>
                    ) : (
                         <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                            <CardHeader>
                                <CardTitle>Nenhuma entrega em andamento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Inicie uma entrega da lista "Para Fazer" para vê-la aqui.</p>
                            </CardContent>
                        </Card>
                    )}
                </section>
            </div>
        </div>
    );
};
