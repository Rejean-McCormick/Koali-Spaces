'use client';

import type { PropsWithChildren } from 'react';
import { usePresentationPreferences } from './PresentationPreferencesProvider';
import { useShell } from './ShellProvider';
import KoaliThemeProvider from './KoaliThemeProvider';

export default function ThemeBridge({ children }: PropsWithChildren) {
  const { state } = useShell();
  const { effective } = usePresentationPreferences();
  return (
    <KoaliThemeProvider theme={state.active_theme} appearance={effective}>
      {children}
    </KoaliThemeProvider>
  );
}
