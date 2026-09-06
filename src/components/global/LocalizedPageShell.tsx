'use client';

import type { ReactNode } from 'react';
import ModulePageShell from '@/components/shell/ModulePageShell';
import { useLocalization } from '@/providers/LocalizationProvider';

export default function LocalizedPageShell({
  titleKey,
  titleFallback,
  descriptionKey,
  descriptionFallback,
  state = 'ready',
  children,
}: {
  titleKey: string;
  titleFallback: string;
  descriptionKey?: string;
  descriptionFallback?: string;
  state?: string;
  children: ReactNode;
}) {
  const { t } = useLocalization();
  return (
    <ModulePageShell
      title={t(titleKey, titleFallback)}
      description={descriptionKey && descriptionFallback ? t(descriptionKey, descriptionFallback) : undefined}
      state={state}
    >
      {children}
    </ModulePageShell>
  );
}
