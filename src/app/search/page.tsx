import SearchSurface from '@/components/global/SearchSurface';
import LocalizedPageShell from '@/components/global/LocalizedPageShell';

export default function Search() {
  return (
    <LocalizedPageShell
      titleKey="space_home.search"
      titleFallback="Recherche"
      descriptionKey="page.search.description"
      descriptionFallback="Agrégation non autoritative de providers admis"
    >
      <SearchSurface />
    </LocalizedPageShell>
  );
}
