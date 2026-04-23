import React from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { Building2, Users, UsersRound, Clock, Webhook, ScrollText } from 'lucide-react';

const links = [
  { to: '', label: 'General', icon: <Building2 className="h-4 w-4" />, end: true },
  { to: 'members', label: 'Members', icon: <Users className="h-4 w-4" /> },
  { to: 'teams', label: 'Teams', icon: <UsersRound className="h-4 w-4" /> },
  { to: 'sla', label: 'SLA Policies', icon: <Clock className="h-4 w-4" /> },
  { to: 'webhooks', label: 'Webhooks', icon: <Webhook className="h-4 w-4" /> },
  { to: 'audit-log', label: 'Audit Log', icon: <ScrollText className="h-4 w-4" /> },
];

export default function SettingsLayout() {
  const { orgId } = useParams<{ orgId: string }>();
  const base = `/orgs/${orgId}/settings`;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="flex gap-6">
        <nav className="w-48 shrink-0 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to === '' ? base : `${base}/${link.to}`}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {link.icon}{link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
