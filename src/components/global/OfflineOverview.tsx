'use client';

import { Table, Tag, Typography } from 'antd';
import { admittedModules } from '@/lib/registry';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useShell } from '@/providers/ShellProvider';

export default function OfflineOverview() {
  const { state } = useShell();
  const { t } = useLocalization();
  const rows = admittedModules(state).flatMap((manifest) =>
    manifest.routes.map((route) => ({
      key: `${manifest.module_id}:${route.route_id}`,
      module: manifest.public_name,
      route: route.default_label,
      behavior: route.offline_behavior,
      availability: route.availability,
    })),
  );

  return (
    <>
      <Typography.Paragraph>
        {t(
          'offline.explanation',
          'Le shell local reste disponible selon le dernier Space validé. Chaque route conserve sa propre déclaration hors ligne; aucune application n’est considérée offline-capable par simple présence dans Koali.',
        )}
      </Typography.Paragraph>
      <Table
        size="small"
        pagination={false}
        dataSource={rows}
        columns={[
          { title: t('offline.module', 'Module'), dataIndex: 'module' },
          { title: t('offline.surface', 'Surface'), dataIndex: 'route' },
          { title: t('offline.availability', 'Disponibilité'), dataIndex: 'availability' },
          { title: t('offline.behavior', 'Hors ligne'), dataIndex: 'behavior', render: (value: string) => <Tag>{value}</Tag> },
        ]}
      />
    </>
  );
}
