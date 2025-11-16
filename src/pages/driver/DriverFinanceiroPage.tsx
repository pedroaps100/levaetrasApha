import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const DriverFinanceiroPage: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Financeiro</CardTitle>
                <CardDescription>Acompanhe suas comissões e pagamentos.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center py-8">Esta funcionalidade será implementada em breve.</p>
            </CardContent>
        </Card>
    );
};

export default DriverFinanceiroPage;
