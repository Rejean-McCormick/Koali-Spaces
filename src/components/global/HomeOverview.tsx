'use client';

import { ArrowRightOutlined } from '@ant-design/icons';
import { Alert, Card, Col, Row, Tag, Typography } from 'antd';
import Link from 'next/link';
import { admittedModules, effectiveHomeRouteId, publicLabel, routeHref, safeRoute } from '@/lib/registry';
import { moduleHealthFor, moduleIsReady } from '@/lib/module-health';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useShell } from '@/providers/ShellProvider';

function healthColor(value: string) {
  if (value === 'starting') return 'processing';
  if (value === 'degraded') return 'warning';
  if (value === 'missing' || value === 'unreachable' || value === 'failed') return 'error';
  return 'default';
}

export default function HomeOverview() {
  const { state } = useShell();
  const { t } = useLocalization();
  const modules = admittedModules(state).filter((manifest) => manifest.module_id !== 'space_home');
  const online = state.network_state !== 'offline';
  const attentionMessage = state.reason ?? (!online
    ? t('home.offline_attention', 'Mode hors ligne : seules les surfaces déclarées disponibles localement restent accessibles.')
    : null);

  const healthLabel = (value: string) => {
    if (value === 'starting') return t('home.status_starting', 'Démarrage');
    if (value === 'degraded') return t('home.status_degraded', 'Dégradé');
    if (value === 'missing' || value === 'unreachable' || value === 'failed') {
      return t('home.status_unavailable', 'Indisponible');
    }
    return t('home.status_unknown', 'État inconnu');
  };

  return (
    <div className="koali-home-overview">
      {attentionMessage ? <Alert type="warning" showIcon message={attentionMessage} className="koali-home-attention" /> : null}

      <div className="koali-section-heading">
        <Typography.Title level={4}>{t('home.applications', 'Applications')}</Typography.Title>
      </div>

      {modules.length ? (
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
            const healthy = moduleIsReady(health);

            return (
              <Col xs={24} sm={12} xl={8} key={manifest.module_id}>
                <Link
                  href={href}
                  className="koali-module-card-link"
                  aria-label={`${t('home.open_application', 'Ouvrir')} ${publicLabel(state.active_space, manifest)}`}
                >
                  <Card className={`koali-module-card is-${health.state}`} hoverable>
                    <div className="koali-module-card-header">
                      <Typography.Text strong className="koali-module-card-title">
                        {publicLabel(state.active_space, manifest)}
                      </Typography.Text>
                      {!healthy ? <Tag color={healthColor(health.state)}>{healthLabel(health.state)}</Tag> : null}
                    </div>

                    <Typography.Paragraph type="secondary" className="koali-module-card-description">
                      {manifest.description ?? t('home.surface_description', 'Surface d’interface admise dans le Space actif.')}
                    </Typography.Paragraph>

                    {health.reason && !healthy ? (
                      <Typography.Text type="secondary" className="koali-module-card-reason">
                        {health.reason}
                      </Typography.Text>
                    ) : null}

                    <div className="koali-module-card-footer">
                      <span className="koali-module-card-cta">
                        {t('home.open_application', 'Ouvrir')}
                        <ArrowRightOutlined aria-hidden />
                      </span>
                    </div>
                  </Card>
                </Link>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Typography.Text type="secondary">
          {t('home.no_applications', 'Aucune application n’est admise dans ce Space.')}
        </Typography.Text>
      )}
    </div>
  );
}
