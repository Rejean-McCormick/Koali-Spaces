import HealthOverview from '@/components/global/HealthOverview';
import LocalizedPageShell from '@/components/global/LocalizedPageShell';

export default function Health() {
  return (
    <LocalizedPageShell
      titleKey="space_home.health"
      titleFallback="État de l’interface"
      descriptionKey="page.health.description"
      descriptionFallback="Santé de la couche de présentation Koali"
    >
      <HealthOverview />
    </LocalizedPageShell>
  );
}
