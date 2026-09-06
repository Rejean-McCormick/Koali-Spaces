'use client';

import { ExpandOutlined, ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Spin, Space, Typography } from 'antd';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { accentCssValue } from '@/lib/surfaces/accent-policy';
import type { SurfaceDescriptorPublic, SurfaceStatus } from '@/lib/surfaces/types';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useSurfaceMode } from '@/providers/SurfaceModeProvider';
import ImmersiveExitControl from './ImmersiveExitControl';
import SurfaceStatusView from './SurfaceStatusView';

const EMBED_LOAD_TIMEOUT_MS = 15_000;

type RenderState = SurfaceStatus['render'];

export default function ApplicationHost({ descriptor }: { descriptor: SurfaceDescriptorPublic }) {
  const { mode, setSurface, enterImmersive } = useSurfaceMode();
  const { t } = useLocalization();
  const router = useRouter();
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [renderState, setRenderState] = useState<RenderState>(descriptor.status.render);
  const [reloadKey, setReloadKey] = useState(0);
  const loadedRef = useRef(false);
  const defaultMode = descriptor.presentation.defaultMode ?? 'framed';

  useEffect(() => {
    setSurface(descriptor.moduleId, defaultMode);
  }, [descriptor.moduleId, defaultMode, setSurface]);

  const embedSrc = descriptor.target?.embedSrc;
  useEffect(() => {
    if (!embedSrc) {
      setRenderState('idle');
      return;
    }
    loadedRef.current = false;
    setFrameLoaded(false);
    setLoadTimedOut(false);
    setRenderState('loading');
    const timer = window.setTimeout(() => {
      if (!loadedRef.current) {
        setLoadTimedOut(true);
        setRenderState('error');
      }
    }, EMBED_LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [embedSrc, reloadKey]);

  if (
    descriptor.status.access === 'blocked' ||
    (descriptor.status.runtime !== 'ready' && descriptor.status.runtime !== 'degraded')
  ) {
    return <SurfaceStatusView descriptor={descriptor} onRetry={() => router.refresh()} />;
  }

  if (!descriptor.target) {
    return (
      <SurfaceStatusView
        descriptor={{ ...descriptor, status: { ...descriptor.status, runtime: 'missing' } }}
      />
    );
  }

  const immersive = mode === 'immersive';
  const retryFrame = () => {
    loadedRef.current = false;
    setFrameLoaded(false);
    setLoadTimedOut(false);
    setRenderState('loading');
    setReloadKey((value) => value + 1);
  };
  const hostStyle = {
    '--koali-surface-accent': accentCssValue(descriptor.presentation.accentTokenRef),
  } as CSSProperties;

  return (
    <section
      className={`koali-application-host ${immersive ? 'is-immersive' : 'is-framed'}`}
      data-module-id={descriptor.moduleId}
      data-accent-token={descriptor.presentation.accentTokenRef ?? ''}
      data-render-state={renderState}
      aria-label={`${descriptor.presentation.label} application surface`}
      style={hostStyle}
    >
      {/* Keep this node mounted while immersive so focus can return to the exact
          parent-owned trigger after exit. CSS hides it visually in immersive mode. */}
      <div className="koali-surface-context-bar" aria-hidden={immersive}>
        <Typography.Text strong>{descriptor.presentation.label}</Typography.Text>
        <Space size="small">
          <Button type="text" icon={<ReloadOutlined />} onClick={retryFrame}>
            {t('surface.retry', 'Réessayer')}
          </Button>
          {descriptor.presentation.immersiveAllowed ? (
            <Button
              type="text"
              icon={<ExpandOutlined />}
              onClick={(event) => enterImmersive(descriptor.moduleId, event.currentTarget)}
            >
              {t('surface.immersive', 'Immersif')}
            </Button>
          ) : null}
        </Space>
      </div>

      {descriptor.status.runtime === 'degraded' ? <SurfaceStatusView descriptor={descriptor} /> : null}

      <div className="koali-application-frame-wrap" aria-busy={renderState === 'loading'}>
        {!frameLoaded && !loadTimedOut ? (
          <div className="koali-application-loading" aria-live="polite">
            <Spin />
            <span>{t('surface.loading', 'Chargement de {label}').replace('{label}', descriptor.presentation.label)}</span>
          </div>
        ) : null}
        {loadTimedOut && !frameLoaded ? (
          <div className="koali-application-loading" role="alert">
            <Space direction="vertical" size="middle" style={{ maxWidth: 520 }}>
              <Alert
                type="warning"
                showIcon
                message={t('surface.timeout_title', 'Le chargement de l’application a expiré')}
                description={t('surface.timeout_description', 'La cible admise n’a pas terminé son chargement dans le délai borné. Koali ne change jamais automatiquement d’origine ou de fournisseur.')}
              />
              <Button icon={<ReloadOutlined />} onClick={retryFrame}>{t('surface.retry_application', 'Réessayer l’application')}</Button>
            </Space>
          </div>
        ) : null}
        <iframe
          key={reloadKey}
          className="koali-application-frame"
          src={descriptor.target.embedSrc}
          title={descriptor.target.iframeTitle}
          sandbox={descriptor.target.sandboxTokens.join(' ')}
          allow={descriptor.target.browserPermissions.join('; ')}
          referrerPolicy="no-referrer"
          onLoad={() => {
            loadedRef.current = true;
            setLoadTimedOut(false);
            setFrameLoaded(true);
            setRenderState('ready');
          }}
          onError={() => {
            loadedRef.current = false;
            setFrameLoaded(false);
            setRenderState('error');
          }}
        />
      </div>
      <ImmersiveExitControl />
    </section>
  );
}
