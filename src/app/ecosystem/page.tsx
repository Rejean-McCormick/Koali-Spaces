import EcosystemOverview from '@/components/global/EcosystemOverview';
import LocalizedPageShell from '@/components/global/LocalizedPageShell';

export default function Ecosystem() {
  return (
    <LocalizedPageShell
      titleKey="space_home.ecosystem"
      titleFallback="Écosystème Koali"
      descriptionKey="page.ecosystem.description"
      descriptionFallback="Services, applications, protocoles et infrastructure réellement reliés à ce workspace Koali"
    >
      <EcosystemOverview />
    </LocalizedPageShell>
  );
}
