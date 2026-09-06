'use client';

import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { SurfaceDescriptorPublic } from '@/lib/surfaces/types';
import { shellPageHref } from '@/lib/surfaces/shell-page-registry';
import { useLocalization } from '@/providers/LocalizationProvider';
import SurfaceStatusView from './SurfaceStatusView';

export default function LocalShellPageSurface({ descriptor }: { descriptor: SurfaceDescriptorPublic }) {
  const router = useRouter();
  const { t } = useLocalization();
  const href = shellPageHref(descriptor.routeId);
  useEffect(() => {
    if (href && descriptor.status.access === 'allowed') router.replace(href);
  }, [href, descriptor.status.access, router]);

  if (!href || descriptor.status.access === 'blocked') return <SurfaceStatusView descriptor={descriptor} />;
  return <div className="koali-surface-status"><Spin /> <span>{t('surface.opening_koali', 'Ouverture de la surface Koali…')}</span></div>;
}
