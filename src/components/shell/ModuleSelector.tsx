'use client';

import { AppstoreOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { activeManifest, admittedModules, publicLabel, safeRoute } from '@/lib/registry';
import { useShell } from '@/providers/ShellProvider';

export default function ModuleSelector() {
  const { state } = useShell();
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
            manifest.home_route_id,
            state.capabilities,
            state.network_state !== 'offline',
          );
          router.push(route.path);
        },
      }}
      trigger={['click']}
    >
      <Button
        type="text"
        icon={<AppstoreOutlined />}
        style={{ height: 48, fontWeight: 600 }}
        aria-label="Select active module"
      >
        {active ? publicLabel(state.active_space, active) : 'Koali Spaces'} <DownOutlined />
      </Button>
    </Dropdown>
  );
}
