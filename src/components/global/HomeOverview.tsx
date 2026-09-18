'use client';

import { ArrowRightOutlined } from '@ant-design/icons';
import { Alert, Badge, Button, Card, Col, Row, Space, Tag, Typography, type BadgeProps } from 'antd';
import type { KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { admittedModules, effectiveHomeRouteId, publicLabel, routeHref, safeRoute } from '@/lib/registry';
import { moduleHealthFor, moduleIsReady } from '@/lib/module-health';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useShell } from '@/providers/ShellProvider';

function healthPresentation(value: string): { status: BadgeProps['status']; color: string; label: string } {
  if (value === 'ready') return { status: 'success', color: 'success', label: 'Prêt' };
  if (value === 'starting') return { status: 'processing', color: 'processing', label: 'Démarrage' };
  if (value === 'degraded') return { status: 'warning', color: 'warning', label: 'Dégradé' };
  if (value === 'missing' || value === 'unreachable' || value === 'failed') return { status: 'error', color: 'error', label: 'Indisponible' };
  return { status: 'default', color: 'default', label: value || 'Inconnu' };
}

export default function HomeOverview() {
  const { state } = useShell();
  const { t } = useLocalization();
  const router = useRouter();
  const modules = admittedModules(state);
  const online = state.network_state !== 'offline';
  const readyCount = modules.filter((manifest) => moduleIsReady(moduleHealthFor(state, manifest.module_id))).length;

  const openFromKeyboard = (event: KeyboardEvent, href: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      router.push(href);
    }
  };

  return (
    <Space direction="vertical" size="large" className="koali-home-overview">
      {state.reason ? <Alert type="warning" showIcon message={state.reason} /> : null}
      <div>
        <div className="koali-section-heading">
          <div>
            <Typography.Title level={4}>{t('home.available_modules', 'Modules disponibles')}</Typography.Title>
            <Typography.Text type="secondary">
              {readyCount}/{modules.length} {t('home.modules_ready', 'modules prêts')}
            </Typography.Text>
          </div>
        </div>

        <Row gutter={[16, 16]}>
          {modules.map((manifest) => {
            const route = safeRoute(
              manifest,
              effectiveHomeRouteId(state.active_space, manifest),
              state.capabilities,
              online,
              state.active_space,
            );
            const href = routeHref(manifest, route);
            const health = moduleHealthFor(state, manifest.module_id);
            const presentation = healthPresentation(health.state);
            const optional = !health.affects_shell_state && manifest.module_id !== 'space_home';

            return (
              <Col xs={24} sm={12} xl={8} key={manifest.module_id}>
                <Card
                  className={`koali-module-card is-${health.state}`}
                  hoverable
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(href)}
                  onKeyDown={(event) => openFromKeyboard(event, href)}
                >
                  <div className="koali-module-card-header">
                    <Space size="small">
                      <Badge status={presentation.status} />
                      <Typography.Text strong className="koali-module-card-title">
                        {publicLabel(state.active_space, manifest)}
                      </Typography.Text>
                    </Space>
                    <Tag color={presentation.color}>{presentation.label}</Tag>
                  </div>

                  <Typography.Paragraph type="secondary" className="koali-module-card-description">
                    {manifest.description ?? t('home.surface_description', 'Surface d’interface admise dans le Space actif.')}
                  </Typography.Paragraph>

                  {health.reason && !moduleIsReady(health) ? (
                    <Typography.Text type="secondary" className="koali-module-card-reason">
                      {health.reason}
                    </Typography.Text>
                  ) : null}

                  <div className="koali-module-card-footer">
                    <Typography.Text type="secondary">
                      {optional ? t('home.optional_module', 'Module optionnel') : t('home.shell_module', 'Module Koali')}
                    </Typography.Text>
                    <Button
                      type="link"
                      icon={<ArrowRightOutlined />}
                      iconPosition="end"
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(href);
                      }}
                    >
                      {t('home.open_module', 'Ouvrir')}
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      <Space wrap className="koali-home-summary">
        <Tag color={state.state === 'ready' ? 'success' : 'warning'}>{t('home.shell', 'Shell')}: {state.state}</Tag>
        <Tag color={state.network_state === 'online' ? 'success' : 'default'}>{t('home.network', 'Réseau')}: {state.network_state}</Tag>
        <Tag>{t('home.capabilities', 'Capabilities projetées')}: {state.capabilities.length}</Tag>
      </Space>
    </Space>
  );
}
