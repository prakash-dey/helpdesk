import { Button } from '@/shared/components/ui/Button';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Workspace</p>
        <p className="text-sm font-semibold text-slate-950">Acme Support</p>
      </div>

      <Button variant="secondary" size="sm">
        Sign out
      </Button>
    </header>
  );
}