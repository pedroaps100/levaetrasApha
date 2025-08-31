import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  Users, 
  Truck, 
  FileText, 
  CreditCard, 
  DollarSign, 
  BarChart3,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/useSidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNotification } from '@/contexts/NotificationContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const NavItem: React.FC<{ item: { title: string; url: string; icon: React.ElementType; badge?: number; }, isCollapsed: boolean }> = ({ item, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === item.url;

  const linkContent = (
    <div className={cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
      isActive && 'bg-primary/10 text-primary',
      isCollapsed && 'justify-center'
    )}>
      <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
      {!isCollapsed && <span className="flex-1">{item.title}</span>}
      {item.badge && item.badge > 0 && !isCollapsed && (
        <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white border-none">
          {item.badge}
        </Badge>
      )}
    </div>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink to={item.url}>
            {linkContent}
          </NavLink>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right">
            <p>{item.title}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

const NavCollapsibleItem: React.FC<{ title: string; icon: React.ElementType; isCollapsed: boolean; children: React.ReactNode; baseUrl: string; }> = ({ title, icon: Icon, isCollapsed, children, baseUrl }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(baseUrl);
    const [isOpen, setIsOpen] = useState(isActive);

    React.useEffect(() => {
        if (isActive) {
            setIsOpen(true);
        }
    }, [isActive]);

    if (isCollapsed) {
        return (
            <>
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child as React.ReactElement<any>, { isCollapsed });
                    }
                    return child;
                })}
            </>
        )
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <button className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isActive && 'text-primary'
                )}>
                    <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                    <span className="flex-1 text-left">{title}</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="py-1 pl-8 pr-3 space-y-1">
                {children}
            </CollapsibleContent>
        </Collapsible>
    );
};

const NavContent: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { solicitacoesCount } = useNotification();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    { title: 'Solicitações', url: '/solicitacoes', icon: Clock, badge: solicitacoesCount },
    { title: 'Clientes', url: '/clientes', icon: Users },
    { title: 'Entregadores', url: '/entregadores', icon: Truck },
    { title: 'Entregas', url: '/entregas', icon: FileText },
    { title: 'Financeiro', url: '/financeiro', icon: DollarSign },
    { title: 'Relatórios', url: '/relatorios', icon: BarChart3 },
  ];
  
  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center border-b px-6", isCollapsed && "px-2 justify-center")}>
        <NavLink to="/" className="flex items-center gap-2 font-semibold text-primary">
          <Truck className="h-7 w-7" />
          {!isCollapsed && <span className="text-lg">Delivery Admin</span>}
        </NavLink>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className={cn("grid items-start gap-1 px-4 text-sm font-medium", isCollapsed && "px-2")}>
          {menuItems.map((item) => (
            <NavItem key={item.title} item={item} isCollapsed={isCollapsed} />
          ))}
          <NavCollapsibleItem title="Faturas" icon={CreditCard} isCollapsed={isCollapsed} baseUrl="/faturas">
             <NavItem item={{ title: 'Gerenciamento', url: '/faturas', icon: CreditCard }} isCollapsed={isCollapsed} />
             <NavItem item={{ title: 'Finalizadas', url: '/faturas/finalizadas', icon: CheckCircle }} isCollapsed={isCollapsed} />
          </NavCollapsibleItem>
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <nav className={cn("grid gap-1 px-2 text-sm font-medium", isCollapsed && "px-0")}>
          <NavItem item={{ title: 'Configurações', url: '/configuracoes', icon: Settings }} isCollapsed={isCollapsed} />
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-muted-foreground transition-all hover:text-primary',
                    isCollapsed && 'justify-center'
                  )}
                >
                  <LogOut className="h-5 w-5" />
                  {!isCollapsed && 'Sair'}
                </button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  <p>Sair</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </nav>
      </div>
    </div>
  );
};

export function AppSidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute top-3 left-4 z-10">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0 w-64">
            <SheetHeader className="sr-only">
                <SheetTitle>Menu Principal</SheetTitle>
                <SheetDescription>Navegação principal do aplicativo.</SheetDescription>
            </SheetHeader>
            <NavContent isCollapsed={false} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:fixed md:inset-y-0 md:left-0 md:z-10 md:flex flex-col bg-card border-r transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <NavContent isCollapsed={isCollapsed} />
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-5 top-16 h-10 w-10 rounded-full border bg-card hover:bg-muted"
          onClick={toggleSidebar}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </aside>
    </>
  );
}
