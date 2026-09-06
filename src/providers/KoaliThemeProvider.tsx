'use client';

import { App as AntdApp, ConfigProvider, theme as antdTheme } from 'antd';
import type { PropsWithChildren } from 'react';
import type { InterfaceTheme, SpaceDefinition } from '@/types/contracts';

type Density = SpaceDefinition['appearance']['density'];

function componentSizeForDensity(density: Density | undefined) {
  if (density === 'compact') return 'small' as const;
  if (density === 'touch') return 'large' as const;
  return 'middle' as const;
}

export default function KoaliThemeProvider({
  theme,
  density,
  children,
}: PropsWithChildren<{ theme: InterfaceTheme | null; density?: Density }>) {
  const primary = theme?.tokens.primary_accent ?? '#1e6864';
  return (
    <ConfigProvider
      componentSize={componentSizeForDensity(density)}
      theme={{
        algorithm: antdTheme.defaultAlgorithm,
        cssVar: true,
        hashed: false,
        token: {
          colorPrimary: primary,
          colorInfo: primary,
          borderRadius: 8,
          colorBgLayout: '#f5f1ea',
          colorBgContainer: '#ffffff',
          colorText: '#1e2524',
          colorTextSecondary: '#66706e',
          colorBorder: '#d9dfdd',
        },
        components: {
          Layout: { siderBg: '#ffffff' },
          Menu: { itemBg: '#ffffff', itemSelectedBg: '#e7f0ef', itemSelectedColor: primary },
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
