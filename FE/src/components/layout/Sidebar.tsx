import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, BookOpen, BarChart3, Settings,
  ChevronLeft, ChevronRight, Headphones,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { Avatar } from '@/components/ui/Avatar';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles?: string[];
}

export function Sidebar() {
  const { orgId } = useParams<{ orgId: string }>();
  const user = useAuthStore((s) => s.user);
  const { sidebarOpen, toggleSidebar } = useUiStore();

  const base = `/orgs/${orgId}`;

  const navItems: NavItem[] = [
    { to: `${base}/dashboard`, icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
    { to: `${base}/tickets`, icon: <Ticket className="h-5 w-5" />, label: 'Tickets' },
    { to: `${base}/kb`, icon: <BookOpen className="h-5 w-5" />, label: 'Knowledge Base' },
    { to: `${base}/analytics`, icon: <BarChart3 className="h-5 w-5" />, label: 'Analytics', roles: ['ADMIN', 'TEAM_LEAD'] },
    { to: `${base}/settings`, icon: <Settings className="h-5 w-5" />, label: 'Settings', roles: ['ADMIN'] },
  ];

  const visibleNav = navItems.filter((item) =>
    !item.roles || item.roles.includes(user?.role ?? ''),
  );

  return (
    <aside
      className={`flex flex-col bg-gray-900 text-gray-300 transition-all duration-200 ${
        sidebarOpen ? 'w-60' : 'w-16'
      } shrink-0 h-screen sticky top-0`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600">
          <Headphones className="h-4 w-4 text-white" />
        </div>
        {sidebarOpen && (
          <span className="font-semibold text-white text-sm truncate">SupportDesk Pro</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {visibleNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
            title={!sidebarOpen ? item.label : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {sidebarOpen && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User & toggle */}
      <div className="border-t border-gray-700 p-3 space-y-2">
        {user && (
          <div className="flex items-center gap-3 px-1">
            <Avatar name={user.name} size="sm" />
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          {sidebarOpen && 'Collapse'}
        </button>
      </div>
    </aside>
  );
}
