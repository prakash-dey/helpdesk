import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { FullPageSpinner } from '@/components/ui/Spinner';

const LoginPage = lazy(() => import('@/modules/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/modules/auth/RegisterPage'));
const AcceptInvitePage = lazy(() => import('@/modules/auth/AcceptInvitePage'));
const DashboardPage = lazy(() => import('@/modules/dashboard/DashboardPage'));
const TicketListPage = lazy(() => import('@/modules/tickets/TicketListPage'));
const TicketDetailPage = lazy(() => import('@/modules/tickets/TicketDetailPage'));
const CreateTicketPage = lazy(() => import('@/modules/tickets/CreateTicketPage'));
const KbListPage = lazy(() => import('@/modules/knowledge-base/KbListPage'));
const KbArticlePage = lazy(() => import('@/modules/knowledge-base/KbArticlePage'));
const KbEditorPage = lazy(() => import('@/modules/knowledge-base/KbEditorPage'));
const AnalyticsPage = lazy(() => import('@/modules/analytics/AnalyticsPage'));
const SettingsLayout = lazy(() => import('@/modules/settings/SettingsLayout'));
const OrgSettingsPage = lazy(() => import('@/modules/settings/OrgSettingsPage'));
const TeamsPage = lazy(() => import('@/modules/settings/TeamsPage'));
const SlaPage = lazy(() => import('@/modules/settings/SlaPage'));
const WebhooksPage = lazy(() => import('@/modules/settings/WebhooksPage'));
const MembersPage = lazy(() => import('@/modules/settings/MembersPage'));
const AuditLogPage = lazy(() => import('@/modules/settings/AuditLogPage'));
const CsatSurveyPage = lazy(() => import('@/modules/csat/CsatSurveyPage'));

export function AppRouter() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        {/* Auth */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="accept-invite" element={<AcceptInvitePage />} />
        </Route>

        {/* CSAT (public) */}
        <Route path="/csat/:surveyId" element={<CsatSurveyPage />} />

        {/* Dashboard */}
        <Route path="/orgs/:orgId" element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tickets" element={<TicketListPage />} />
          <Route path="tickets/new" element={<CreateTicketPage />} />
          <Route path="tickets/:ticketId" element={<TicketDetailPage />} />
          <Route path="kb" element={<KbListPage />} />
          <Route path="kb/articles/:articleId" element={<KbArticlePage />} />
          <Route path="kb/articles/new" element={<KbEditorPage />} />
          <Route path="kb/articles/:articleId/edit" element={<KbEditorPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<OrgSettingsPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="sla" element={<SlaPage />} />
            <Route path="webhooks" element={<WebhooksPage />} />
            <Route path="audit-log" element={<AuditLogPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Suspense>
  );
}
