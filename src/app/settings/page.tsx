import SettingsOverview from '@/components/global/SettingsOverview';
import LocalizedPageShell from '@/components/global/LocalizedPageShell';

export default function Settings() {
  return (
    <LocalizedPageShell titleKey="page.settings.title" titleFallback="Paramètres de présentation">
      <SettingsOverview />
    </LocalizedPageShell>
  );
}
