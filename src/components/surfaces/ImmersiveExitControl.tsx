'use client';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useEffect } from 'react';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useSurfaceMode } from '@/providers/SurfaceModeProvider';

export default function ImmersiveExitControl() {
  const { mode, exitImmersive } = useSurfaceMode();
  const { t } = useLocalization();

  useEffect(() => {
    if (mode !== 'immersive') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        exitImmersive();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, exitImmersive]);

  if (mode !== 'immersive') return null;
  return (
    <Button
      className="koali-immersive-exit"
      icon={<ArrowLeftOutlined />}
      onClick={exitImmersive}
    >
      {t('surface.return_to_koali', 'Retour à Koali')}
    </Button>
  );
}
