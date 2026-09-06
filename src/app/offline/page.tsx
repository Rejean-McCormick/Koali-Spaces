import OfflineOverview from '@/components/global/OfflineOverview';
import LocalizedPageShell from '@/components/global/LocalizedPageShell';

export default function Offline() {
  return (
    <LocalizedPageShell
      titleKey="space_home.offline"
      titleFallback="Hors ligne"
      descriptionKey="page.offline.description"
      descriptionFallback="Disponibilité locale déclarée par les surfaces admises"
      state="offline"
    >
      <OfflineOverview />
    </LocalizedPageShell>
  );
}
