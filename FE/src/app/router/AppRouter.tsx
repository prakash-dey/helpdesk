import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";
import { LoginPage } from "@/features/auth/LoginPage";
import { AnalyticsPage } from "@/features/analytics/AnalyticsPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { KnowledgeBasePage } from "@/features/knowledge-base/KnowledgeBasePage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { TicketListPage } from "@/features/tickets/TicketListPage";
import { ForbiddenPage } from "@/features/system/ForbiddenPage";
import { NotFoundPage } from "@/features/system/NotFoundPage";
import { UnauthorizedPage } from "@/features/system/UnauthorizedPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    path: "/forbidden",
    element: <ForbiddenPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
  {
    path: "/orgs/:orgId",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "tickets", element: <TicketListPage /> },
      { path: "kb", element: <KnowledgeBasePage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
