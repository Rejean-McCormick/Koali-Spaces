'use client';

import { Alert, Descriptions, Space, Typography } from 'antd';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useShell } from '@/providers/ShellProvider';

export default function SettingsOverview() {
  const { state } = useShell();
  const { locale, t } = useLocalization();

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Descriptions bordered size="small" column={1}>
        <Descriptions.Item label={t('settings.language', 'Langue')}>{locale}</Descriptions.Item>
        <Descriptions.Item label={t('settings.density', 'Densité')}>{state.active_space?.appearance.density ?? 'comfortable'}</Descriptions.Item>
        <Descriptions.Item label={t('settings.theme', 'Thème')}>{state.active_theme?.theme_id ?? 'default'}</Descriptions.Item>
        <Descriptions.Item label={t('settings.reduced_motion', 'Réduction des animations')}>
          {t('settings.reduced_motion_value', 'Respecte prefers-reduced-motion')}
        </Descriptions.Item>
      </Descriptions>
      <Alert
        type="info"
        showIcon
        message={t('settings.presentation_only', 'Préférences de présentation uniquement')}
        description={t(
          'settings.presentation_only_description',
          'Les rôles, capabilities, services, credentials et paramètres internes des applications restent chez leurs propriétaires.',
        )}
      />
      <Typography.Paragraph type="secondary">
        {t('settings.persistence_note', 'La persistance utilisateur avancée des préférences reste séparée des données métier des modules.')}
      </Typography.Paragraph>
    </Space>
  );
}
