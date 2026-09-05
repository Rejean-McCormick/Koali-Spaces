'use client';

import {
  DisconnectOutlined,
  MenuOutlined,
  ReloadOutlined,
  SearchOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import { Badge, Button, Space, Typography } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import {
  activeManifest,
  routeById,
  visibleTopbarWidgets,
} from '@/lib/registry';
import { useShell } from '@/providers/ShellProvider';
import type { TopbarWidget } from '@/types/contracts';

function WidgetAction({ widget }: { widget: TopbarWidget }) {
  const { state } = useShell();
  const router = useRouter();
  const pathname = usePathname();
  const manifest = activeManifest(state, pathname);
  const route = widget.activation.kind === 'route' ? routeById(manifest, widget.activation.route_id ?? null) : null;
  if (widget.kind === 'status') {
    return <Typography.Text type="secondary">{widget.label}</Typography.Text>;
  }
  if (!route) return null;
  return (
    <Button
      type={widget.slot === 'primary' ? 'primary' : 'text'}
      icon={widget.kind === 'search' ? <SearchOutlined /> : undefined}
      onClick={() => router.push(route.path)}
    >
      {widget.label}
    </Button>
  );
}

export default function SharedTopBar({ onMenu }: { onMenu: () => void }) {
  const { state, refresh } = useShell();
  const pathname = usePathname();
  const manifest = activeManifest(state, pathname);
  const offline = state.network_state === 'offline';
  const widgets = visibleTopbarWidgets(state.active_space, manifest, state);
  return (
    <header className="koa-topbar">
      <Button
        className="koa-mobile-menu"
        type="text"
        icon={<MenuOutlined />}
        onClick={onMenu}
        aria-label="Open module navigation"
      />
      <Typography.Text strong>{state.active_space?.title ?? 'Koali Spaces'}</Typography.Text>
      <div className="koa-topbar-widgets">
        {widgets.map((widget) => <WidgetAction key={widget.widget_id} widget={widget} />)}
      </div>
      <Space size="middle">
        <Badge
          status={
            state.state === 'ready'
              ? 'success'
              : state.state === 'degraded' || state.state === 'offline'
                ? 'warning'
                : 'default'
          }
          text={state.state}
        />
        <span aria-label={offline ? 'Offline' : 'Local network available'}>
          {offline ? <DisconnectOutlined /> : <WifiOutlined />}
        </span>
        <Button
          type="text"
          aria-label="Refresh shell state"
          icon={<ReloadOutlined />}
          onClick={() => void refresh()}
        />
      </Space>
    </header>
  );
}
