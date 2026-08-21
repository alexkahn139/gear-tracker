import type { ReactNode } from 'react';
import { useMe } from '@/hooks/useApi.js';
import { Sidebar } from '@/components/layout/Sidebar.js';
import { TopBar } from '@/components/layout/TopBar.js';

export function Layout({ children }: { children: ReactNode }) {
  const { data: user } = useMe();

  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar />
      <div className="flex min-h-0 flex-1 flex-col">
        <TopBar userName={user?.name} />
        <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
