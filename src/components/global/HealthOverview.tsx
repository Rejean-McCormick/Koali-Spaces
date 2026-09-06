'use client';

import { Descriptions, List, Space, Tag, Typography } from 'antd';
import { admittedModules } from '@/lib/registry';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useShell } from '@/providers/ShellProvider';

export default function HealthOverview() {
  const { state } = useShell();
  const { t } = useLocalization();
  const modules = admittedModules(state);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
        <Descriptions.Item label={t('health.shell', 'Shell')}>{state.state}</Descriptions.Item>
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
          renderItem={(manifest) => (
            <List.Item extra={<Tag>{manifest.offline_behavior.module_state}</Tag>}>
              <List.Item.Meta title={manifest.public_name} description={manifest.module_id} />
            </List.Item>
          )}
        />
      </div>
    </Space>
  );
}
