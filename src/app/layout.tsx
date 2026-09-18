import type { Metadata } from 'next';
import './globals.css';
import GlobalShell from '@/components/shell/GlobalShell';
import { LocalizationProvider } from '@/providers/LocalizationProvider';
import { PresentationPreferencesProvider } from '@/providers/PresentationPreferencesProvider';
import { ShellProvider } from '@/providers/ShellProvider';
import { SurfaceModeProvider } from '@/providers/SurfaceModeProvider';
import ThemeBridge from '@/providers/ThemeBridge';
import { APPEARANCE_BOOT_SCRIPT } from '@/lib/appearance-boot-script';
import { readServerShellState } from '@/lib/shell-state.server';

export const metadata: Metadata = {
  title: 'Koali Spaces',
  description: 'Local-first Koali experience layer',
};

// Shell state is a local runtime projection and must never be frozen at build time.
export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialShellState = await readServerShellState();

  return (
    <html lang="fr-CA" suppressHydrationWarning>
      <head>
        <script id="koali-appearance-boot" dangerouslySetInnerHTML={{ __html: APPEARANCE_BOOT_SCRIPT }} />
      </head>
      <body>
        <ShellProvider initialState={initialShellState}>
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
