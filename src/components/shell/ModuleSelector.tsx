'use client';

import { AppstoreOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Typography } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import {
  activeManifest,
  admittedModules,
  admittedSurfaceProfiles,
  defaultSurfaceProfile,
  effectiveHomeRouteId,
  publicLabel,
  routeHref,
  safeRoute,
} from '@/lib/registry';
import { hrefWithKoaliSurface } from '@/lib/shell-navigation-state';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useShell } from '@/providers/ShellProvider';

export default function ModuleSelector() {
  const { state } = useShell();
  const { t } = useLocalization();
  const router = useRouter();
  const pathname = usePathname();
  const modules = admittedModules(state);
  const active = activeManifest(state, pathname) ?? modules[0] ?? null;

  if (modules.length <= 1) {
    return (
      <div className="koa-module-identity" aria-label={t('shell.active_module', 'Module actif')}>
        <AppstoreOutlined aria-hidden />
        <Typography.Text strong>{active ? publicLabel(state.active_space, active) : 'Koali Spaces'}</Typography.Text>
      </div>
    );
  }

  const items = modules.map((manifest) => ({
    key: manifest.module_id,
    label: publicLabel(state.active_space, manifest),
  }));
  return (
    <Dropdown
      menu={{
        items,
        onClick: ({ key }) => {
          const manifest = modules.find((candidate) => candidate.module_id === key);
          if (!manifest) return;
          const surfaces = admittedSurfaceProfiles(manifest, state);
          const surface = defaultSurfaceProfile(manifest, state);
          const route = safeRoute(
            manifest,
            effectiveHomeRouteId(state.active_space, manifest, surface?.surface_id),
            state.capabilities,
            state.network_state !== 'offline',
            state.active_space,
            surface?.surface_id,
          );
          router.push(
            hrefWithKoaliSurface(
              routeHref(manifest, route),
              surfaces.length > 1 ? surface?.surface_id ?? null : null,
            ),
          );
        },
      }}
      trigger={['click']}
    >
      <Button
        type="text"
        icon={<AppstoreOutlined />}
        className="koa-module-selector-button"
        aria-label={t('shell.module_selector', 'Sélectionner le produit actif')}
      >
        {active ? publicLabel(state.active_space, active) : 'Koali Spaces'} <DownOutlined />
      </Button>
    </Dropdown>
  );
}
