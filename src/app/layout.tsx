import type { Metadata } from 'next';
import './globals.css';
import GlobalShell from '@/components/shell/GlobalShell';
import { ShellProvider } from '@/providers/ShellProvider';
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
          <ThemeBridge>
            <GlobalShell>{children}</GlobalShell>
          </ThemeBridge>
        </ShellProvider>
      </body>
    </html>
  );
}
