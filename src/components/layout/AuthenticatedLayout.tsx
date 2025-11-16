import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { useSidebar } from '@/hooks/useSidebar';
import { cn } from '@/lib/utils';

export const AuthenticatedLayout: React.FC = () => {
  const { isCollapsed } = useSidebar();
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        <AppHeader />
        <main className="flex-1 bg-muted/40 p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
