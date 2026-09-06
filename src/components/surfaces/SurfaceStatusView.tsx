'use client';

import { Alert, Button, Space, Typography } from 'antd';
import type { SurfaceDescriptorPublic, SurfaceErrorCode } from '@/lib/surfaces/types';
import { useLocalization } from '@/providers/LocalizationProvider';

const { Text } = Typography;

export function SurfaceResolutionErrorView({
  code,
  message,
}: {
  code: SurfaceErrorCode;
  message: string;
}) {
  const { t } = useLocalization();
  return (
    <section className="koali-surface-status" role="alert">
      <Alert
        type="error"
        showIcon
        message={t('surface.unavailable', 'Surface indisponible')}
        description={
          <Space direction="vertical" size={4}>
            <span>{message}</span>
            <Text code>{code}</Text>
          </Space>
        }
      />
    </section>
  );
}

export default function SurfaceStatusView({
  descriptor,
  onRetry,
}: {
  descriptor: SurfaceDescriptorPublic;
  onRetry?: () => void;
}) {
  const { t } = useLocalization();
  const { status } = descriptor;
  if (status.access === 'blocked') {
    return (
      <section className="koali-surface-status">
        <Alert
          type="warning"
          showIcon
          message={t('surface.access_unavailable', 'Accès indisponible')}
          description={t(
            'surface.access_description',
            'La politique de présentation active n’autorise pas cette surface. Koali Spaces ne contourne pas la frontière d’autorisation du propriétaire.',
          )}
        />
      </section>
    );
  }

  const unavailable = status.runtime === 'missing' || status.runtime === 'failed';
  const pending = status.runtime === 'inactive' || status.runtime === 'starting';
  if (unavailable || pending) {
    return (
      <section className="koali-surface-status">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            type={unavailable ? 'error' : 'info'}
            showIcon
            message={unavailable
              ? t('surface.application_unavailable', 'Application indisponible')
              : t('surface.application_not_ready', 'Application non prête')}
            description={unavailable
              ? t(
                  'surface.application_unavailable_description',
                  'Le runtime enregistré de l’application est absent ou en échec. Aucun fournisseur alternatif n’est sélectionné automatiquement.',
                )
              : t(
                  'surface.application_not_ready_description',
                  'Le runtime de l’application n’est pas encore prêt. Son lifecycle reste la responsabilité de la frontière propriétaire ou kOA déclarée.',
                )}
          />
          {onRetry ? <Button onClick={onRetry}>{t('surface.retry', 'Réessayer')}</Button> : null}
        </Space>
      </section>
    );
  }

  if (status.runtime === 'degraded') {
    return (
      <Alert
        className="koali-surface-degraded-banner"
        type="warning"
        showIcon
        message={t('surface.runtime_degraded', 'Le runtime de l’application est dégradé')}
      />
    );
  }

  return null;
}
