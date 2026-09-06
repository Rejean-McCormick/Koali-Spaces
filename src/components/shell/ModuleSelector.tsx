'use client';

import { AppstoreOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import {
  activeManifest,
  admittedModules,
  effectiveHomeRouteId,
  publicLabel,
  routeHref,
  safeRoute,
} from '@/lib/registry';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useShell } from '@/providers/ShellProvider';

export default function ModuleSelector() {
  const { state } = useShell();
  const { t } = useLocalization();
  const router = useRouter();
  const pathname = usePathname();
  const modules = admittedModules(state);
  const active = activeManifest(state, pathname) ?? modules[0] ?? null;
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
          const route = safeRoute(
            manifest,
            effectiveHomeRouteId(state.active_space, manifest),
            state.capabilities,
            state.network_state !== 'offline',
            state.active_space,
          );
          router.push(routeHref(manifest, route));
        },
      }}
      trigger={['click']}
    >
      <Button
        type="text"
        icon={<AppstoreOutlined />}
        style={{ height: 48, fontWeight: 600 }}
        aria-label={t('shell.module_selector', 'Sélectionner le module actif')}
      >
        {active ? publicLabel(state.active_space, active) : 'Koali Spaces'} <DownOutlined />
      </Button>
    </Dropdown>
  );
}
