# Konnaxion interface adaptation map

Source snapshot examined: `C:\mycode\Konnaxion\Konnaxion`, generated 2026-09-05 10:23.

Adapted structural patterns:
- `frontend/components/layout-components/MainLayout.tsx` → `src/components/shell/GlobalShell.tsx`;
- `LogoTitle.tsx` → manifest-driven `ModuleSelector.tsx`;
- `Sider.tsx` + `Drawer.tsx` → responsive `ActiveModuleSidebar.tsx`;
- `Header.tsx` → `SharedTopBar.tsx`;
- suite-specific `*PageShell.tsx` → generic `ModulePageShell.tsx`;
- `context/ThemeContext.tsx` + `src/theme/*` → contract-driven `KoaliThemeProvider.tsx`.

Reference stack alignment:
- Next.js 15 family, with Koali Spaces pinned to the maintained 15.5.24 security release rather than copying Konnaxion's older 15.3.1 revision;
- React / React DOM 18.2.0;
- Ant Design 5.26.2;
- `@ant-design/pro-components` 2.8.10;
- TypeScript 5.9.x;
- pnpm 10.20.0.

Visual alignment:
- the reference Koali themes keep the Konnaxion-aligned single primary accent `#1e6864`;
- surfaces remain predominantly neutral;
- icons are local, outline-oriented assets;
- status colors are semantic state indicators only and never authority signals.

Offline adaptation:
- browser-rendered does not mean Internet-dependent;
- shell JavaScript, CSS, icons, localization files and manifest assets are packaged locally;
- remote runtime asset dependencies are rejected;
- module availability is determined by admitted manifests, Koali capability projection and declared offline behavior.

Not copied: Konnaxion routes, business pages, APIs, authentication logic, EkoH/EthiKos/KeenKonnect/KonnectED/Kreative domain services, workflows, data models, domain validation, or backend code.
