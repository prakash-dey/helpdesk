import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Settings,
  Ticket,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useAppSelector } from '@/store/hooks';

const navItems = [
  { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: 'tickets', label: 'Tickets', icon: Ticket },
  { path: 'kb', label: 'Knowledge Base', icon: BookOpen },
  { path: 'analytics', label: 'Analytics', icon: BarChart3 },
  { path: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const orgId = useAppSelector((state) => state.auth.user?.orgId);

  return (
    <aside className="hidden min-h-screen w-64 border-r border-slate-200 bg-white lg:block">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-lg font-bold text-slate-950">SupportDesk</p>
        <p className="text-sm text-slate-500">Agent Console</p>
      </div>

      <nav className="space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const to = orgId ? `/orgs/${orgId}/${item.path}` : '#';

          return (
            <NavLink
              key={item.path}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}