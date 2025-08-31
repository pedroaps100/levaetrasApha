import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Despesa } from '@/types';
import { format } from 'date-fns';

interface DespesasTabProps {
    despesas: Despesa[];
}

export const DespesasTab: React.FC<DespesasTabProps> = ({ despesas }) => {
    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Detalhamento de Despesas</CardTitle>
                <CardDescription>Lista de todas as despesas registradas no período selecionado.</CardDescription>
            </CardHeader>
            <CardContent>
                 {/* Desktop View */}
                 <div className="hidden md:block border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Fornecedor</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {despesas.map(d => (
                                <TableRow key={d.id}>
                                    <TableCell className="font-medium">{d.descricao}</TableCell>
                                    <TableCell><Badge variant="secondary">{d.categoria}</Badge></TableCell>
                                    <TableCell>{d.fornecedor}</TableCell>
                                    <TableCell>{format(d.vencimento, 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(d.valor)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 {/* Mobile View */}
                 <div className="grid gap-4 md:hidden">
                    {despesas.map(d => (
                        <Card key={d.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base">{d.descricao}</CardTitle>
                                    <p className="font-bold text-base">{formatCurrency(d.valor)}</p>
                                </div>
                                <CardDescription>{d.fornecedor}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center">
                                    <span className="font-medium text-muted-foreground mr-2">Categoria:</span>
                                    <Badge variant="secondary">{d.categoria}</Badge>
                                </div>
                                <div><span className="font-medium text-muted-foreground">Vencimento:</span> {format(d.vencimento, 'dd/MM/yyyy')}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {despesas.length === 0 && (
                    <div className="text-center text-muted-foreground py-10">Nenhuma despesa registrada no período selecionado.</div>
                )}
            </CardContent>
        </Card>
    );
};
