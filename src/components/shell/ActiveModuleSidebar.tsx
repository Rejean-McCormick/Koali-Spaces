'use client';

import { Drawer, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { activeManifest, visibleSidebarItems } from '@/lib/registry';
import { useShell } from '@/providers/ShellProvider';

export default function ActiveModuleSidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const { state } = useShell();
  const router = useRouter();
  const pathname = usePathname();
  const manifest = activeManifest(state, pathname);
  const routeMap = new Map(
    manifest?.routes.map((route) => [route.route_id, route.path]) ?? [],
  );
  const items: MenuProps['items'] = manifest
    ? visibleSidebarItems(manifest, state)
        .sort((a, b) => a.order - b.order)
        .map((item) =>
          'children' in item
            ? {
                key: item.item_id,
                label: item.label,
                children: [...item.children]
                  .sort((a, b) => a.order - b.order)
                  .map((child) => ({ key: child.route_id, label: child.label })),
              }
            : { key: item.route_id, label: item.label },
        )
    : [];
  const selectedKeys =
    manifest?.routes
      .filter((route) =>
        route.path === '/' ? pathname === '/' : pathname === route.path || pathname.startsWith(`${route.path}/`),
      )
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
      <aside className="koa-sider" aria-label="Module navigation">
        {menu}
      </aside>
      <Drawer
        open={mobileOpen}
        onClose={onMobileClose}
        placement="left"
        closable
        width={300}
        styles={{ body: { padding: 0 } }}
        title={manifest?.public_name ?? 'Navigation'}
      >
        {menu}
      </Drawer>
    </>
  );
}
