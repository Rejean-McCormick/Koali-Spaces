import { fireEvent, render } from '@testing-library/react';
import { vi, describe, expect, it } from 'vitest';
import ApplicationHost from '@/components/surfaces/ApplicationHost';
import type { SurfaceDescriptorPublic } from '@/lib/surfaces/types';
import { SurfaceModeProvider } from '@/providers/SurfaceModeProvider';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const descriptor: SurfaceDescriptorPublic = {
  surfaceId: 'space:demo:demo.home',
  moduleId: 'demo',
  routeId: 'demo.home',
  kind: 'local_module_surface',
  status: { access: 'allowed', runtime: 'ready', connectivity: 'online', render: 'idle' },
  presentation: { label: 'Demo', immersiveAllowed: true, defaultMode: 'framed', accentTokenRef: 'module.demo' },
  target: { embedSrc: '/__fixture', iframeTitle: 'Demo app', sandboxTokens: ['allow-scripts'], browserPermissions: [] },
};

describe('ApplicationHost', () => {
  it('changes framed/immersive layout without remounting the iframe', () => {
    const view = render(<SurfaceModeProvider><ApplicationHost descriptor={descriptor} /></SurfaceModeProvider>);
    const frame = view.getByTitle('Demo app');
    fireEvent.click(view.getByRole('button', { name: /immersif/i }));
    expect(view.getByRole('button', { name: /retour à koali/i })).toBeInTheDocument();
    expect(view.getByTitle('Demo app')).toBe(frame);
    fireEvent.click(view.getByRole('button', { name: /retour à koali/i }));
    expect(view.getByTitle('Demo app')).toBe(frame);
  });

  it('keeps the parent trigger mounted and restores focus after leaving immersive mode', async () => {
    const view = render(<SurfaceModeProvider><ApplicationHost descriptor={descriptor} /></SurfaceModeProvider>);
    const immersiveButton = view.getByRole('button', { name: /immersif/i });
    immersiveButton.focus();
    fireEvent.click(immersiveButton);
    fireEvent.click(view.getByRole('button', { name: /retour à koali/i }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.activeElement).toBe(immersiveButton);
  });

  it('tracks browser render loading and ready state separately from runtime readiness', () => {
    const view = render(<SurfaceModeProvider><ApplicationHost descriptor={descriptor} /></SurfaceModeProvider>);
    const host = view.container.querySelector('.koali-application-host');
    const frame = view.getByTitle('Demo app');
    expect(host).toHaveAttribute('data-render-state', 'loading');
    fireEvent.load(frame);
    expect(host).toHaveAttribute('data-render-state', 'ready');
  });

  it('binds the semantic accent token through a safe CSS variable indirection', () => {
    const view = render(<SurfaceModeProvider><ApplicationHost descriptor={descriptor} /></SurfaceModeProvider>);
    const host = view.container.querySelector('.koali-application-host') as HTMLElement;
    expect(host.dataset.accentToken).toBe('module.demo');
    expect(host.style.getPropertyValue('--koali-surface-accent')).toContain('--koali-accent-module-demo');
  });
});
