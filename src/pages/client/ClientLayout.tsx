import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, History, Wallet, LogOut, Menu, Truck } from 'lucide-react';

const ClientHeader: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { title: 'Dashboard', url: '/cliente', icon: LayoutDashboard },
        { title: 'Histórico', url: '/cliente/historico', icon: History },
        { title: 'Financeiro', url: '/cliente/financeiro', icon: Wallet },
    ];

    return (
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-30">
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <NavLink to="/cliente" className="flex items-center gap-2 text-lg font-semibold md:text-base text-primary">
                    <Truck className="h-6 w-6" />
                    <span className="sr-only">Delivery App</span>
                </NavLink>
                {navItems.map(item => (
                    <NavLink key={item.title} to={item.url} className={({ isActive }) => `transition-colors hover:text-foreground ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {item.title}
                    </NavLink>
                ))}
            </nav>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <nav className="grid gap-6 text-lg font-medium">
                         <NavLink to="/cliente" className="flex items-center gap-2 text-lg font-semibold text-primary">
                            <Truck className="h-6 w-6" />
                            <span>Delivery App</span>
                        </NavLink>
                        {navItems.map(item => (
                            <NavLink key={item.title} to={item.url} className={({ isActive }) => `flex items-center gap-4 px-2.5 ${isActive ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground`}>
                                <item.icon className="h-5 w-5" />
                                {item.title}
                            </NavLink>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
            <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
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
                        <DropdownMenuItem>Configurações</DropdownMenuItem>
                        <DropdownMenuItem>Suporte</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export const ClientLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <ClientHeader />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/40">
                <Outlet />
            </main>
        </div>
    );
};
