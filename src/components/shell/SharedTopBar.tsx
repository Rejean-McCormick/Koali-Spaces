'use client';

import {
  DisconnectOutlined,
  InfoCircleOutlined,
  MenuOutlined,
  SearchOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Button, Space, Typography } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import type { RefObject } from 'react';
import {
  activeManifest,
  admittedSurfaceProfiles,
  defaultSurfaceProfile,
  routeByIdInState,
  routeHref,
  publicLabel,
  visibleTopbarWidgets,
} from '@/lib/registry';
import { optionalModuleIssues } from '@/lib/module-health';
import { hrefWithKoaliSurface } from '@/lib/shell-navigation-state';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useShell } from '@/providers/ShellProvider';
import type { TopbarWidget } from '@/types/contracts';
import ModuleSelector from './ModuleSelector';
import ProductSurfaceSelector from './ProductSurfaceSelector';

function WidgetAction({ widget, activeSurfaceId, activeModuleId }: { widget: TopbarWidget; activeSurfaceId: string | null; activeModuleId: string | null }) {
  const { state } = useShell();
  const { t } = useLocalization();
  const router = useRouter();
  const resolved = widget.activation.kind === 'route'
    ? routeByIdInState(state, widget.activation.route_id ?? null)
    : null;
  const label = t(widget.label_key, widget.label);

  if (widget.projection_ref) return null;
  if (widget.kind === 'status' && widget.activation.kind === 'none') {
    return <Typography.Text className={widget.compact_only ? 'koa-widget-compact-only' : undefined} type="secondary">{label}</Typography.Text>;
  }
  if (!resolved) return null;
  const targetSurfaces = admittedSurfaceProfiles(resolved.manifest, state);
  const targetSurfaceId = targetSurfaces.length > 1
    ? resolved.manifest.module_id === activeModuleId
      ? activeSurfaceId
      : defaultSurfaceProfile(resolved.manifest, state)?.surface_id ?? null
    : null;
  return (
    <Button
      className={widget.compact_only ? 'koa-widget-compact-only' : undefined}
      type={widget.slot === 'primary' ? 'primary' : 'text'}
      icon={widget.kind === 'search' ? <SearchOutlined /> : undefined}
      onClick={() => router.push(hrefWithKoaliSurface(routeHref(resolved.manifest, resolved.route), targetSurfaceId))}
    >
      {label}
    </Button>
  );
}

function ShellStatusIndicators() {
  const { state } = useShell();
  const { t } = useLocalization();
  const router = useRouter();
  const offline = state.network_state === 'offline' || state.state === 'offline';
  const attention = offline || ['degraded', 'unavailable', 'error'].includes(state.state);
  const optionalIssues = optionalModuleIssues(state);

  if (!optionalIssues.length && !attention) return null;

  return (
    <Space size="small" className="koa-shell-status-group">
      {optionalIssues.length ? (
        <Button
          type="text"
          size="small"
          className="koa-optional-module-attention"
          icon={<InfoCircleOutlined />}
          onClick={() => router.push('/health')}
        >
          {optionalIssues.length === 1
            ? t('shell.one_optional_issue', '1 module optionnel')
            : t('shell.optional_issues', '{count} modules optionnels').replace('{count}', String(optionalIssues.length))}
        </Button>
      ) : null}

      {attention ? (
        <Button
          type="text"
          size="small"
          className="koa-shell-attention"
          icon={offline ? <DisconnectOutlined /> : <WarningOutlined />}
          onClick={() => router.push('/health')}
          aria-label={t('shell.open_health', 'Ouvrir l’état de l’interface')}
        >
          {offline ? t('network.offline', 'Hors ligne') : t('shell.attention_required', 'État dégradé')}
        </Button>
      ) : null}
    </Space>
  );
}

export default function SharedTopBar({
  onMenu,
  activeSurfaceId,
  hasSidebar,
  menuButtonRef,
}: {
  onMenu: () => void;
  activeSurfaceId: string | null;
  hasSidebar: boolean;
  menuButtonRef: RefObject<HTMLButtonElement>;
}) {
  const { state } = useShell();
  const { t } = useLocalization();
  const pathname = usePathname();
  const manifest = activeManifest(state, pathname);
  const widgets = visibleTopbarWidgets(state.active_space, manifest, state, activeSurfaceId);
  return (
    <header className="koa-topbar">
      {hasSidebar ? (
        <Button
          ref={menuButtonRef}
          className="koa-mobile-menu"
          type="text"
          icon={<MenuOutlined />}
          onClick={onMenu}
          aria-label={t('shell.open_navigation', 'Ouvrir la navigation du module')}
        />
      ) : null}
      <div className="koa-mobile-module-selector">
        <ModuleSelector compact />
      </div>
      <div className="koa-context-title">
        <Typography.Text strong className="koa-context-title-text">
          {manifest ? publicLabel(state.active_space, manifest) : state.active_space?.title ?? 'Koali Spaces'}
        </Typography.Text>
        <ProductSurfaceSelector activeSurfaceId={activeSurfaceId} />
      </div>
      <div className="koa-topbar-widgets">
        {widgets.map((widget) => <WidgetAction key={widget.widget_id} widget={widget} activeSurfaceId={activeSurfaceId} activeModuleId={manifest?.module_id ?? null} />)}
      </div>
      <ShellStatusIndicators />
    </header>
  );
}
