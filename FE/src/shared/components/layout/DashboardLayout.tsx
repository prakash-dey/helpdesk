import { Outlet } from "react-router-dom";
import { Header } from "@/shared/components/layout/Header";
import { Sidebar } from "@/shared/components/layout/Sidebar";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Header />

          <main className="px-6 py-6">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
