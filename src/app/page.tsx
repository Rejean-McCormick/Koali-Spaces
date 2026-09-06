import HomeOverview from '@/components/global/HomeOverview';
import LocalizedPageShell from '@/components/global/LocalizedPageShell';

export default function Home() {
  return (
    <LocalizedPageShell
      titleKey="space_home.home"
      titleFallback="Accueil"
      descriptionKey="page.home.description"
      descriptionFallback="Launchpad du Space Koali actif"
    >
      <HomeOverview />
    </LocalizedPageShell>
  );
}
