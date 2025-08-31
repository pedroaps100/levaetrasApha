import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Truck, History, Wallet, UserCircle, LogOut } from 'lucide-react';

const DriverHeader: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-30">
            <NavLink to="/entregador" className="flex items-center gap-2 text-lg font-semibold md:text-base text-primary">
                <Truck className="h-6 w-6" />
                <span className="font-bold">Painel do Entregador</span>
            </NavLink>
            <div className="flex w-full items-center justify-end gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.avatar} alt={user?.nome} />
                                <AvatarFallback>{user?.nome?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{user?.nome}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Meu Perfil</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

const DriverBottomNav: React.FC = () => {
    const navItems = [
        { title: 'Entregas', url: '/entregador', icon: Truck },
        { title: 'Histórico', url: '/entregador/historico', icon: History },
        { title: 'Financeiro', url: '/entregador/financeiro', icon: Wallet },
        { title: 'Perfil', url: '/entregador/perfil', icon: UserCircle },
    ];

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t md:hidden">
            <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
                {navItems.map(item => (
                    <NavLink key={item.title} to={item.url} className={({ isActive }) => `inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        <item.icon className="w-5 h-5 mb-1" />
                        <span className="text-xs">{item.title}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
}

export const DriverLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <DriverHeader />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/40 mb-16 md:mb-0">
                <Outlet />
            </main>
            <DriverBottomNav />
        </div>
    );
};
