'use client';

import { AppstoreOutlined, DownOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, Space, Typography, type BadgeProps } from 'antd';
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
import { moduleHealthFor } from '@/lib/module-health';
import { hrefWithKoaliSurface } from '@/lib/shell-navigation-state';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useShell } from '@/providers/ShellProvider';

function badgeStatus(value: string): BadgeProps['status'] {
  if (value === 'ready') return 'success';
  if (value === 'starting') return 'processing';
  if (value === 'degraded') return 'warning';
  if (value === 'missing' || value === 'unreachable' || value === 'failed') return 'error';
  return 'default';
}

export default function ModuleSelector() {
  const { state } = useShell();
  const { t } = useLocalization();
  const router = useRouter();
  const pathname = usePathname();
  const modules = admittedModules(state);
  const active = activeManifest(state, pathname) ?? modules[0] ?? null;
  const activeHealth = active ? moduleHealthFor(state, active.module_id) : null;

  if (modules.length <= 1) {
    return (
      <div className="koa-module-identity" aria-label={t('shell.active_module', 'Module actif')}>
        <AppstoreOutlined aria-hidden />
        <Typography.Text strong>{active ? publicLabel(state.active_space, active) : 'Koali Spaces'}</Typography.Text>
      </div>
    );
  }

  const items = modules.map((manifest) => {
    const health = moduleHealthFor(state, manifest.module_id);
    return {
      key: manifest.module_id,
      label: (
        <span className="koa-module-dropdown-item">
          <Badge status={badgeStatus(health.state)} />
          <span>{publicLabel(state.active_space, manifest)}</span>
          {!health.affects_shell_state && manifest.module_id !== 'space_home' ? (
            <span className="koa-module-optional-label">{t('shell.optional', 'optionnel')}</span>
          ) : null}
        </span>
      ),
    };
  });

  return (
    <Dropdown
      menu={{
        items,
        selectedKeys: active ? [active.module_id] : [],
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
        className="koa-module-selector-button"
        aria-label={t('shell.module_selector', 'Sélectionner le produit actif')}
      >
        <Space size="small" className="koa-module-selector-content">
          <AppstoreOutlined />
          {activeHealth ? <Badge status={badgeStatus(activeHealth.state)} /> : null}
          <span className="koa-module-selector-label">{active ? publicLabel(state.active_space, active) : 'Koali Spaces'}</span>
          <DownOutlined className="koa-module-selector-chevron" />
        </Space>
      </Button>
    </Dropdown>
  );
}
