'use client';

import { Drawer, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import {
  activeManifest,
  routeCapabilityAllowed,
  routeHref,
  routeSelectedForPath,
  visibleSidebarItems,
} from '@/lib/registry';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useShell } from '@/providers/ShellProvider';

export default function ActiveModuleSidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const { state } = useShell();
  const { t } = useLocalization();
  const router = useRouter();
  const pathname = usePathname();
  const manifest = activeManifest(state, pathname);
  const routeMap = new Map(
    manifest?.routes.map((route) => [route.route_id, routeHref(manifest, route)]) ?? [],
  );
  const items: MenuProps['items'] = manifest
    ? visibleSidebarItems(manifest, state)
        .sort((a, b) => a.order - b.order)
        .map((item) =>
          'children' in item
            ? {
                key: item.item_id,
                label: t(item.label_key, item.label),
                children: [...item.children]
                  .sort((a, b) => a.order - b.order)
                  .map((child) => {
                    const route = manifest.routes.find((candidate) => candidate.route_id === child.route_id);
                    const denied = route ? !routeCapabilityAllowed(route, state.capabilities) : true;
                    return {
                      key: child.route_id,
                      label: t(child.label_key, child.label),
                      disabled: Boolean(denied && route?.capability_policy.denied_behavior === 'disabled'),
                    };
                  }),
              }
            : (() => {
                const route = manifest.routes.find((candidate) => candidate.route_id === item.route_id);
                const denied = route ? !routeCapabilityAllowed(route, state.capabilities) : true;
                return {
                  key: item.route_id,
                  label: t(item.label_key, item.label),
                  disabled: Boolean(denied && route?.capability_policy.denied_behavior === 'disabled'),
                };
              })(),
        )
    : [];
  const selectedKeys =
    manifest?.routes
      .filter((route) => routeSelectedForPath(manifest, route, pathname))
      .map((route) => route.route_id) ?? [];
  const menu = (
    <Menu
      mode="inline"
      items={items}
      selectedKeys={selectedKeys}
      onClick={({ key }) => {
        const target = routeMap.get(String(key));
        if (target) {
          router.push(target);
          onMobileClose();
        }
      }}
    />
  );
  return (
    <>
      <aside className="koa-sider" aria-label={t('shell.module_navigation', 'Navigation du module')}>
        {menu}
      </aside>
      <Drawer
        open={mobileOpen}
        onClose={onMobileClose}
        placement="left"
        closable
        width={300}
        styles={{ body: { padding: 0 } }}
        title={manifest?.public_name ?? t('shell.navigation', 'Navigation')}
      >
        {menu}
      </Drawer>
    </>
  );
}
