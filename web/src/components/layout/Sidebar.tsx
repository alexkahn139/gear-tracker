import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils.js';

export type NavItem = {
  to: string;
  label: string;
};

const defaultItems: NavItem[] = [
  { to: '/', label: 'Inventory' },
  { to: '/loans', label: 'Loans' },
  { to: '/trips', label: 'Trips' },
];

export function Sidebar({ items = defaultItems }: { items?: NavItem[] }) {
  return (
    <aside className="flex w-full flex-row items-center gap-1 border-b bg-card md:h-full md:w-56 md:flex-col md:items-stretch md:border-b-0 md:border-r md:px-3 md:py-6">
      <div className="hidden px-3 py-2 md:block">
        <p className="text-lg font-bold tracking-tight">Gear Tracker</p>
        <p className="text-xs text-muted-foreground">Shared hiking gear pool</p>
      </div>
      <nav className="flex flex-row gap-1 px-1 pb-1 md:flex-col md:gap-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
