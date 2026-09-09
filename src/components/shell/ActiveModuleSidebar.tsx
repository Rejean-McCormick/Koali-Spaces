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
import { hrefWithKoaliSurface, surfaceSelectionIsAddressable } from '@/lib/shell-navigation-state';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useShell } from '@/providers/ShellProvider';

export default function ActiveModuleSidebar({
  mobileOpen,
  onMobileClose,
  activeSurfaceId,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
  activeSurfaceId: string | null;
}) {
  const { state } = useShell();
  const { t } = useLocalization();
  const router = useRouter();
  const pathname = usePathname();
  const manifest = activeManifest(state, pathname);
  const addressableSurface = manifest ? surfaceSelectionIsAddressable(manifest, state) : false;
  const routeMap = new Map(
    manifest?.routes.map((route) => [
      route.route_id,
      hrefWithKoaliSurface(routeHref(manifest, route), addressableSurface ? activeSurfaceId : null),
    ]) ?? [],
  );
  const visibleItems = manifest
    ? visibleSidebarItems(manifest, state, activeSurfaceId).sort((a, b) => a.order - b.order)
    : [];
  const items: MenuProps['items'] = manifest
    ? visibleItems.map((item) =>
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

  if (!manifest || visibleItems.length === 0) return null;

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
      <aside className="koa-sider" aria-label={t('shell.module_navigation', 'Navigation du produit')}>
        {menu}
      </aside>
      <Drawer
        open={mobileOpen}
        onClose={onMobileClose}
        placement="left"
        closable
        width={300}
        styles={{ body: { padding: 0 } }}
        title={manifest.public_name}
      >
        {menu}
      </Drawer>
    </>
  );
}
