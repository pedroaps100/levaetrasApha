import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Truck,
  LogOut,
  Settings,
  UserCircle
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
import { navigationConfig, NavItemConfig } from '@/lib/navigation';
import { Separator } from '../ui/separator';

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
      {item.badge > 0 && !isCollapsed && (
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

const NavCollapsibleItem: React.FC<{ item: NavItemConfig; isCollapsed: boolean; children: React.ReactNode; }> = ({ item, isCollapsed, children }) => {
    const location = useLocation();
    const isActive = item.children?.some(child => location.pathname.startsWith(child.url)) ?? false;
    const [isOpen, setIsOpen] = useState(isActive);

    React.useEffect(() => {
        setIsOpen(isActive);
    }, [isActive, location.pathname]);

    if (isCollapsed) {
        return <>{children}</>;
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <button className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isActive && 'text-primary'
                )}>
                    <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                    <span className="flex-1 text-left">{item.title}</span>
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
  const { user, logout } = useAuth();
  const { solicitacoesCount } = useNotification();
  
  const menuItems = user ? navigationConfig[user.role] : [];

  const getBadgeCount = (badgeKey?: string) => {
    if (badgeKey === 'solicitacoes' && user?.role === 'admin') {
      return solicitacoesCount;
    }
    return 0;
  };

  const homeUrl = user ? (user.role === 'admin' ? '/' : `/${user.role}`) : '/';

  const getProfileUrl = () => {
    if (!user) return '#';
    switch (user.role) {
      case 'admin': return '/configuracoes';
      case 'cliente': return '/cliente/perfil';
      case 'entregador': return '/entregador/perfil';
      default: return '#';
    }
  };
  const getProfileTitle = () => user?.role === 'admin' ? 'Configurações' : 'Meu Perfil';

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center border-b px-6", isCollapsed && "px-2 justify-center")}>
        <NavLink to={homeUrl} className="flex items-center gap-2 font-semibold text-primary">
          <Truck className="h-7 w-7" />
          {!isCollapsed && <span className="text-lg">Delivery App</span>}
        </NavLink>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className={cn("grid items-start gap-1 px-4 text-sm font-medium", isCollapsed && "px-2")}>
          {menuItems.map((item) => (
            item.children ? (
              <NavCollapsibleItem key={item.title} item={item} isCollapsed={isCollapsed}>
                {item.children.map(child => (
                   <NavItem key={child.title} item={{...child, badge: getBadgeCount(child.badge)}} isCollapsed={isCollapsed} />
                ))}
              </NavCollapsibleItem>
            ) : (
              <NavItem key={item.title} item={{...item, badge: getBadgeCount(item.badge)}} isCollapsed={isCollapsed} />
            )
          ))}
        </nav>
      </div>
      <div className={cn("mt-auto border-t p-4", isCollapsed && "p-2")}>
        <nav className="grid gap-1">
          <NavItem
            isCollapsed={isCollapsed}
            item={{
              title: getProfileTitle(),
              url: getProfileUrl(),
              icon: user?.role === 'admin' ? Settings : UserCircle,
            }}
          />
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={logout}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isCollapsed && 'justify-center'
                  )}
                >
                  <LogOut className="h-5 w-5" />
                  {!isCollapsed && <span className="flex-1 text-left">Sair</span>}
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
