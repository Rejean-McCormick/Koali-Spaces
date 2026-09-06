export const SURFACE_SANDBOX_TOKENS = [
  'allow-downloads',
  'allow-forms',
  'allow-modals',
  'allow-orientation-lock',
  'allow-pointer-lock',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
  'allow-presentation',
  'allow-same-origin',
  'allow-scripts',
  'allow-storage-access-by-user-activation',
  'allow-top-navigation-by-user-activation',
] as const;

/**
 * Closed v1 permission catalogue. Adding a permission requires a code/schema
 * update and a negative security test, as required by the Surface Layer locks.
 */
export const SURFACE_BROWSER_PERMISSIONS = [
  'autoplay',
  'camera',
  'clipboard-read',
  'clipboard-write',
  'display-capture',
  'encrypted-media',
  'fullscreen',
  'geolocation',
  'microphone',
  'payment',
  'picture-in-picture',
  'publickey-credentials-get',
  'screen-wake-lock',
  'web-share',
] as const;

export type SurfaceSandboxToken = (typeof SURFACE_SANDBOX_TOKENS)[number];
export type SurfaceBrowserPermission = (typeof SURFACE_BROWSER_PERMISSIONS)[number];
