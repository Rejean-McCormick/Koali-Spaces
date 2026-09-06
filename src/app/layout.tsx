import type { Metadata } from 'next';
import './globals.css';
import GlobalShell from '@/components/shell/GlobalShell';
import { LocalizationProvider } from '@/providers/LocalizationProvider';
import { ShellProvider } from '@/providers/ShellProvider';
import { SurfaceModeProvider } from '@/providers/SurfaceModeProvider';
import ThemeBridge from '@/providers/ThemeBridge';

export const metadata: Metadata = {
  title: 'Koali Spaces',
  description: 'Local-first Koali experience layer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA">
      <body>
        <ShellProvider>
          <LocalizationProvider>
            <ThemeBridge>
              <SurfaceModeProvider>
                <GlobalShell>{children}</GlobalShell>
              </SurfaceModeProvider>
            </ThemeBridge>
          </LocalizationProvider>
        </ShellProvider>
      </body>
    </html>
  );
}
