'use client';

import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import {
  activeManifest,
  admittedSurfaceProfiles,
  effectiveHomeRouteId,
  routeHref,
  safeRoute,
} from '@/lib/registry';
import { hrefWithKoaliSurface } from '@/lib/shell-navigation-state';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useShell } from '@/providers/ShellProvider';

export default function ProductSurfaceSelector({
  activeSurfaceId,
}: {
  activeSurfaceId: string | null;
}) {
  const { state } = useShell();
  const { t } = useLocalization();
  const pathname = usePathname();
  const router = useRouter();
  const manifest = activeManifest(state, pathname);
  if (!manifest) return null;

  const surfaces = admittedSurfaceProfiles(manifest, state);
  if (surfaces.length <= 1) return null;
  const active = surfaces.find((surface) => surface.surface_id === activeSurfaceId) ?? surfaces[0];

  return (
    <Dropdown
      menu={{
        items: surfaces.map((surface) => ({
          key: surface.surface_id,
          label: t(surface.label_key, surface.label),
        })),
        onClick: ({ key }) => {
          const surface = surfaces.find((candidate) => candidate.surface_id === key);
          if (!surface) return;
          const route = safeRoute(
            manifest,
            effectiveHomeRouteId(state.active_space, manifest, surface.surface_id),
            state.capabilities,
            state.network_state !== 'offline',
            state.active_space,
            surface.surface_id,
          );
          router.push(hrefWithKoaliSurface(routeHref(manifest, route), surface.surface_id));
        },
      }}
      trigger={['click']}
    >
      <Button
        type="text"
        size="small"
        className="koa-surface-selector"
        aria-label={t('shell.surface_selector', 'Sélectionner la surface du produit')}
      >
        {t(active.label_key, active.label)} <DownOutlined />
      </Button>
    </Dropdown>
  );
}
