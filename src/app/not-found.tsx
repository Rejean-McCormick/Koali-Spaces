import ModulePageShell from '@/components/shell/ModulePageShell';

export default function NotFound() {
  return (
    <ModulePageShell title="Page unavailable" state="unavailable">
      <p>The requested local presentation route is not admitted in the active Space.</p>
    </ModulePageShell>
  );
}
