'use client';

import { Alert, Card, Col, Row, Space, Tag, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { admittedModules, effectiveHomeRouteId, publicLabel, routeHref, safeRoute } from '@/lib/registry';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useShell } from '@/providers/ShellProvider';

export default function HomeOverview() {
  const { state } = useShell();
  const { t } = useLocalization();
  const router = useRouter();
  const modules = admittedModules(state);
  const online = state.network_state !== 'offline';

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {state.reason ? <Alert type={state.state === 'ready' ? 'info' : 'warning'} showIcon message={state.reason} /> : null}
      <div>
        <Typography.Title level={4}>{t('home.available_modules', 'Modules disponibles')}</Typography.Title>
        <Row gutter={[16, 16]}>
          {modules.map((manifest) => {
            const route = safeRoute(
              manifest,
              effectiveHomeRouteId(state.active_space, manifest),
              state.capabilities,
              online,
              state.active_space,
            );
            return (
              <Col xs={24} sm={12} lg={8} key={manifest.module_id}>
                <Card
                  hoverable
                  title={publicLabel(state.active_space, manifest)}
                  extra={<Tag>{manifest.offline_behavior.module_state}</Tag>}
                  onClick={() => router.push(routeHref(manifest, route))}
                >
                  {manifest.description ?? t('home.surface_description', 'Surface d’interface admise dans le Space actif.')}
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
      <Space wrap>
        <Tag color={state.state === 'ready' ? 'success' : 'warning'}>{t('home.shell', 'Shell')}: {state.state}</Tag>
        <Tag>{t('home.network', 'Réseau')}: {state.network_state}</Tag>
        <Tag>{t('home.capabilities', 'Capabilities projetées')}: {state.capabilities.length}</Tag>
      </Space>
    </Space>
  );
}
