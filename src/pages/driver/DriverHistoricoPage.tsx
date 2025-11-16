import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const DriverHistoricoPage: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Histórico de Entregas</CardTitle>
                <CardDescription>Consulte todas as entregas que você já realizou.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center py-8">Esta funcionalidade será implementada em breve.</p>
            </CardContent>
        </Card>
    );
};

export default DriverHistoricoPage;
