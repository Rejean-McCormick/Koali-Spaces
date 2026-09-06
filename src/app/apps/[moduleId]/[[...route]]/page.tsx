import ModulePageShell from '@/components/shell/ModulePageShell';

type ModuleSurfaceProps = {
  params: Promise<{
    moduleId: string;
    route?: string[];
  }>;
};

export default async function ModuleSurface({ params }: ModuleSurfaceProps) {
  const { moduleId, route } = await params;

  return (
    <ModulePageShell title={moduleId} description="Admitted module surface">
      <p>
        Logical route: {route?.join('/') || 'home'}. The owner-provided local
        surface is resolved through its admitted module and asset manifests.
        Koali Spaces does not recreate the business implementation owned by the
        module.
      </p>
    </ModulePageShell>
  );
}
