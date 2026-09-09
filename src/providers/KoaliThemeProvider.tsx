'use client';

import { App as AntdApp, ConfigProvider, theme as antdTheme } from 'antd';
import { useInsertionEffect, type PropsWithChildren } from 'react';
import type { EffectiveAppearance } from '@/lib/presentation-preferences';
import type { InterfaceTheme } from '@/types/contracts';

function componentSizeForDensity(density: EffectiveAppearance['density']) {
  if (density === 'compact') return 'small' as const;
  if (density === 'touch') return 'large' as const;
  return 'middle' as const;
}

function cssValue(value: string | number) {
  return typeof value === 'number' ? `${value}px` : value;
}

function KoaliSemanticTokenBridge({ appearance }: { appearance: EffectiveAppearance }) {
  const { token } = antdTheme.useToken();

  useInsertionEffect(() => {
    const root = document.documentElement;
    const variables: Record<string, string> = {
      '--koali-color-bg-layout': token.colorBgLayout,
      '--koali-color-bg-container': token.colorBgContainer,
      '--koali-color-bg-subtle': token.colorFillQuaternary,
      '--koali-color-text': token.colorText,
      '--koali-color-text-secondary': token.colorTextSecondary,
      '--koali-color-border': token.colorBorder,
      '--koali-color-border-secondary': token.colorBorderSecondary,
      '--koali-shadow-floating': token.boxShadowSecondary,
      '--koali-shadow-surface': token.boxShadowSecondary,
      '--koali-surface-radius': cssValue(token.borderRadius),
    };

    root.dataset.koaliColorScheme = appearance.resolvedMode;
    root.dataset.koaliSurfaceStyle = appearance.surfaceStyle;
    root.dataset.koaliDensity = appearance.density;
    root.dataset.koaliAccent = appearance.accent;
    root.style.setProperty('--koali-accent', appearance.accentColor);
    for (const [name, value] of Object.entries(variables)) root.style.setProperty(name, value);

    return () => {
      delete root.dataset.koaliColorScheme;
      delete root.dataset.koaliSurfaceStyle;
      delete root.dataset.koaliDensity;
      delete root.dataset.koaliAccent;
      root.style.removeProperty('--koali-accent');
      for (const name of Object.keys(variables)) root.style.removeProperty(name);
    };
  }, [
    appearance.accent,
    appearance.accentColor,
    appearance.density,
    appearance.resolvedMode,
    appearance.surfaceStyle,
    token.borderRadius,
    token.boxShadowSecondary,
    token.colorBgContainer,
    token.colorBgLayout,
    token.colorBorder,
    token.colorBorderSecondary,
    token.colorFillQuaternary,
    token.colorText,
    token.colorTextSecondary,
  ]);

  return null;
}

export default function KoaliThemeProvider({
  theme,
  appearance,
  children,
}: PropsWithChildren<{ theme: InterfaceTheme | null; appearance: EffectiveAppearance }>) {
  const borderRadius = Number(theme?.framework_mapping?.['antd.borderRadius'] ?? 8);
  const safeBorderRadius = Number.isFinite(borderRadius) ? borderRadius : 8;

  return (
    <ConfigProvider
      componentSize={componentSizeForDensity(appearance.density)}
      theme={{
        algorithm:
          appearance.resolvedMode === 'dark'
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
        cssVar: true,
        hashed: false,
        token: {
          colorPrimary: appearance.accentColor,
          colorInfo: appearance.accentColor,
          borderRadius: safeBorderRadius,
        },
      }}
    >
      <KoaliSemanticTokenBridge appearance={appearance} />
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
