import fs from 'node:fs';

const contracts = [
  'contracts/koa/accent-palette.schema.json',
  'contracts/koa/space-definition.schema.json',
  'contracts/koa/module-interface-manifest.schema.json',
  'contracts/koa/product-surface-profile.schema.json',
  'contracts/koa/route-contribution.schema.json',
  'contracts/koa/sidebar-navigation.schema.json',
  'contracts/koa/topbar-widget.schema.json',
  'contracts/koa/interface-theme.schema.json',
  'contracts/koa/presentation-preferences.schema.json',
  'contracts/koa/interface-asset-manifest.schema.json',
  'contracts/koa/space-activation-receipt.schema.json',
  'contracts/koali/surface-runtime-registry.schema.json',
  'docs/06-surface-layer/schemas/runtime-registration.schema.json',
  'docs/06-surface-layer/schemas/surface-presentation-policy.schema.json',
  'docs/06-surface-layer/schemas/surface-descriptor-public.schema.json',
  'docs/06-surface-layer/schemas/application-conformance-profile.schema.json',
];
for (const path of contracts) JSON.parse(fs.readFileSync(path, 'utf8'));
console.log(`PASS: ${contracts.length} bundled Koali interface and Surface Layer contracts parse`);
