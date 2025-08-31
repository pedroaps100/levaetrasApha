import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ComissoesTabProps {
    relatorioComissoes: {
        entregadorId: string;
        nome: string;
        avatar?: string;
        totalEntregas: number;
        valorTotalGerado: number;
        comissaoTotal: number;
    }[];
}

export const ComissoesTab: React.FC<ComissoesTabProps> = ({ relatorioComissoes }) => {
    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Relatório de Comissões</CardTitle>
                    <CardDescription>Visualize o desempenho e as comissões de cada entregador no período selecionado.</CardDescription>
                </div>
                <Button variant="outline" className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> Exportar</Button>
            </CardHeader>
            <CardContent>
                {/* Desktop View */}
                <div className="hidden md:block border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Entregador</TableHead>
                                <TableHead className="text-center">Nº de Entregas</TableHead>
                                <TableHead className="text-right">Valor Gerado (Taxas)</TableHead>
                                <TableHead className="text-right">Comissão a Pagar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {relatorioComissoes.map(item => (
                                <TableRow key={item.entregadorId}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={item.avatar} />
                                                <AvatarFallback>{item.nome.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{item.nome}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{item.totalEntregas}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.valorTotalGerado)}</TableCell>
                                    <TableCell className="text-right font-bold text-primary">{formatCurrency(item.comissaoTotal)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 {/* Mobile View */}
                 <div className="grid gap-4 md:hidden">
                    {relatorioComissoes.map(item => (
                        <Card key={item.entregadorId}>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={item.avatar} />
                                        <AvatarFallback>{item.nome.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <CardTitle className="text-base">{item.nome}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>Nº de Entregas:</span> <span className="font-medium">{item.totalEntregas}</span></div>
                                <div className="flex justify-between"><span>Valor Gerado:</span> <span className="font-medium">{formatCurrency(item.valorTotalGerado)}</span></div>
                                <div className="flex justify-between items-center text-base">
                                    <span className="font-semibold">Comissão:</span>
                                    <span className="font-bold text-primary">{formatCurrency(item.comissaoTotal)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {relatorioComissoes.length === 0 && (
                    <div className="text-center text-muted-foreground py-10">Nenhuma comissão a ser paga no período selecionado.</div>
                )}
            </CardContent>
        </Card>
    );
};
