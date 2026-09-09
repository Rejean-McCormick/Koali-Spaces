'use client';

import { Alert, Button, Descriptions, Form, Segmented, Select, Space, Typography } from 'antd';
import { ACCENT_PALETTE, type AccentId, type AppearanceMode, type Density, type SurfaceStyle } from '@/lib/presentation-preferences';
import { useLocalization } from '@/providers/LocalizationProvider';
import { usePresentationPreferences } from '@/providers/PresentationPreferencesProvider';
import { useShell } from '@/providers/ShellProvider';

export default function SettingsOverview() {
  const { state } = useShell();
  const { locale, t } = useLocalization();
  const {
    effective,
    policy,
    setAccent,
    setDensity,
    setMode,
    setSurfaceStyle,
    reset,
  } = usePresentationPreferences();

  const accentOptions = policy.allowedAccents.map((accent) => ({
    value: accent,
    label: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span
          aria-hidden="true"
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: ACCENT_PALETTE[accent].color,
            border: '1px solid var(--koali-color-border-secondary)',
          }}
        />
        {t(`settings.accent.${accent}`, accent)}
      </span>
    ),
  }));

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Descriptions bordered size="small" column={1}>
        <Descriptions.Item label={t('settings.language', 'Langue')}>{locale}</Descriptions.Item>
        <Descriptions.Item label={t('settings.space_theme', 'Thème de base du Space')}>
          {state.active_theme?.theme_id ?? 'default'}
        </Descriptions.Item>
        <Descriptions.Item label={t('settings.reduced_motion', 'Réduction des animations')}>
          {t('settings.reduced_motion_value', 'Respecte prefers-reduced-motion')}
        </Descriptions.Item>
      </Descriptions>

      <div className="koali-settings-panel">
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          {t('settings.appearance', 'Apparence')}
        </Typography.Title>
        <Form layout="vertical">
          <Form.Item label={t('settings.mode', 'Mode')}>
            <Segmented
              value={effective.mode}
              options={policy.allowedModes.map((mode) => ({
                value: mode,
                label: t(`settings.mode.${mode}`, mode),
              }))}
              onChange={(value) => setMode(value as AppearanceMode)}
            />
          </Form.Item>

          <Form.Item label={t('settings.accent', 'Couleur')}>
            <Select
              value={effective.accent}
              options={accentOptions}
              onChange={(value) => setAccent(value as AccentId)}
              style={{ width: 'min(100%, 320px)' }}
            />
          </Form.Item>

          <Form.Item label={t('settings.surface_style', 'Surfaces')}>
            <Segmented
              value={effective.surfaceStyle}
              options={policy.allowedSurfaceStyles.map((surfaceStyle) => ({
                value: surfaceStyle,
                label: t(`settings.surface_style.${surfaceStyle}`, surfaceStyle),
              }))}
              onChange={(value) => setSurfaceStyle(value as SurfaceStyle)}
            />
          </Form.Item>

          <Form.Item label={t('settings.density', 'Densité')}>
            <Segmented
              value={effective.density}
              options={policy.allowedDensities.map((density) => ({
                value: density,
                label: t(`settings.density.${density}`, density),
              }))}
              onChange={(value) => setDensity(value as Density)}
            />
          </Form.Item>

          <Button onClick={reset}>{t('settings.reset', 'Réinitialiser selon le Space')}</Button>
        </Form>
      </div>

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
        {t(
          'settings.persistence_note',
          'Ces préférences sont enregistrées localement sur cet appareil et restent séparées de l’activation, des capabilities et des données métier du Space.',
        )}
      </Typography.Paragraph>
    </Space>
  );
}
