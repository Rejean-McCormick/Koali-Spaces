import type { Metadata } from 'next';
import './globals.css';
import GlobalShell from '@/components/shell/GlobalShell';
import { LocalizationProvider } from '@/providers/LocalizationProvider';
import { PresentationPreferencesProvider } from '@/providers/PresentationPreferencesProvider';
import { ShellProvider } from '@/providers/ShellProvider';
import { SurfaceModeProvider } from '@/providers/SurfaceModeProvider';
import ThemeBridge from '@/providers/ThemeBridge';
import { APPEARANCE_BOOT_SCRIPT } from '@/lib/appearance-boot-script';

export const metadata: Metadata = {
  title: 'Koali Spaces',
  description: 'Local-first Koali experience layer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA" suppressHydrationWarning>
      <head>
        <script id="koali-appearance-boot" dangerouslySetInnerHTML={{ __html: APPEARANCE_BOOT_SCRIPT }} />
      </head>
      <body>
        <ShellProvider>
          <PresentationPreferencesProvider>
            <LocalizationProvider>
              <ThemeBridge>
                <SurfaceModeProvider>
                  <GlobalShell>{children}</GlobalShell>
                </SurfaceModeProvider>
              </ThemeBridge>
            </LocalizationProvider>
          </PresentationPreferencesProvider>
        </ShellProvider>
      </body>
    </html>
  );
}
