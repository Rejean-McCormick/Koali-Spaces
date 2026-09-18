'use client';

import { Badge, Descriptions, List, Space, Tag, Typography, type BadgeProps } from 'antd';
import { admittedModules } from '@/lib/registry';
import { moduleHealthFor } from '@/lib/module-health';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useShell } from '@/providers/ShellProvider';

function healthPresentation(value: string): { status: BadgeProps['status']; color: string; label: string } {
  if (value === 'ready') return { status: 'success', color: 'success', label: 'Prêt' };
  if (value === 'starting') return { status: 'processing', color: 'processing', label: 'Démarrage' };
  if (value === 'degraded') return { status: 'warning', color: 'warning', label: 'Dégradé' };
  if (value === 'missing' || value === 'unreachable' || value === 'failed') return { status: 'error', color: 'error', label: 'Indisponible' };
  return { status: 'default', color: 'default', label: value || 'Inconnu' };
}

export default function HealthOverview() {
  const { state } = useShell();
  const { t } = useLocalization();
  const modules = admittedModules(state);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
        <Descriptions.Item label={t('health.shell', 'Shell')}><Tag color={state.state === 'ready' ? 'success' : 'warning'}>{state.state}</Tag></Descriptions.Item>
        <Descriptions.Item label={t('health.network', 'Réseau')}>{state.network_state}</Descriptions.Item>
        <Descriptions.Item label={t('health.space', 'Space')}>{state.active_space?.title ?? '—'}</Descriptions.Item>
        <Descriptions.Item label={t('health.space_version', 'Version du Space')}>{state.active_space?.version ?? '—'}</Descriptions.Item>
        <Descriptions.Item label={t('health.theme', 'Thème')}>{state.active_theme?.theme_id ?? '—'}</Descriptions.Item>
        <Descriptions.Item label={t('health.capabilities', 'Capabilities projetées')}>{state.capabilities.length}</Descriptions.Item>
      </Descriptions>
      <div>
        <Typography.Title level={4}>{t('health.admitted_modules', 'Modules admis')}</Typography.Title>
        <List
          bordered
          dataSource={modules}
          locale={{ emptyText: t('health.no_modules', 'Aucun module admis') }}
          renderItem={(manifest) => {
            const health = moduleHealthFor(state, manifest.module_id);
            const presentation = healthPresentation(health.state);
            const optional = !health.affects_shell_state && manifest.module_id !== 'space_home';
            return (
              <List.Item
                extra={<Space><Tag>{optional ? t('health.optional', 'optionnel') : t('health.shell_critical', 'Shell')}</Tag><Tag color={presentation.color}>{presentation.label}</Tag></Space>}
              >
                <List.Item.Meta
                  avatar={<Badge status={presentation.status} />}
                  title={manifest.public_name}
                  description={health.reason && health.state !== 'ready' ? health.reason : manifest.module_id}
                />
              </List.Item>
            );
          }}
        />
      </div>
    </Space>
  );
}
