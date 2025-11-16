import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const ClientPerfilPage: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Meu Perfil</CardTitle>
                <CardDescription>Gerencie suas informações pessoais e de acesso.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center py-8">Esta funcionalidade será implementada em breve.</p>
            </CardContent>
        </Card>
    );
};

export default ClientPerfilPage;
