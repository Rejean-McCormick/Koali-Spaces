import ModulePageShell from '@/components/shell/ModulePageShell';

export default function Tasks() {
  return (
    <ModulePageShell
      title="Tasks"
      description="Local presentation of pending governed operations and owner-provided work queues"
    >
      <p>
        Koali Spaces only presents task state supplied by admitted Koali owners. It does not execute,
        authorize, or silently complete governed operations.
      </p>
    </ModulePageShell>
  );
}
