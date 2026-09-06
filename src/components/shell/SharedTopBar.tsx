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
  routeByIdInState,
  routeHref,
  visibleTopbarWidgets,
} from '@/lib/registry';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useShell } from '@/providers/ShellProvider';
import type { TopbarWidget } from '@/types/contracts';

function WidgetAction({ widget }: { widget: TopbarWidget }) {
  const { state } = useShell();
  const { t } = useLocalization();
  const router = useRouter();
  const resolved = widget.activation.kind === 'route'
    ? routeByIdInState(state, widget.activation.route_id ?? null)
    : null;
  const label = t(widget.label_key, widget.label);

  if (widget.kind === 'status' && widget.activation.kind === 'none') {
    return <Typography.Text className={widget.compact_only ? 'koa-widget-compact-only' : undefined} type="secondary">{label}</Typography.Text>;
  }
  if (widget.activation.kind === 'status_provider' || widget.kind === 'counter') return null;
  if (!resolved) return null;
  return (
    <Button
      className={widget.compact_only ? 'koa-widget-compact-only' : undefined}
      type={widget.slot === 'primary' ? 'primary' : 'text'}
      icon={widget.kind === 'search' ? <SearchOutlined /> : undefined}
      onClick={() => router.push(routeHref(resolved.manifest, resolved.route))}
    >
      {label}
    </Button>
  );
}

export default function SharedTopBar({ onMenu }: { onMenu: () => void }) {
  const { state, refresh } = useShell();
  const { t } = useLocalization();
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
        aria-label={t('shell.open_navigation', 'Ouvrir la navigation du module')}
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
        <span aria-label={offline ? t('network.offline', 'Hors ligne') : t('network.local', 'Réseau local disponible')}>
          {offline ? <DisconnectOutlined /> : <WifiOutlined />}
        </span>
        <Button
          type="text"
          aria-label={t('shell.refresh', 'Actualiser l’état du shell')}
          icon={<ReloadOutlined />}
          onClick={() => void refresh()}
        />
      </Space>
    </header>
  );
}
