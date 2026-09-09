const ACCENT_TOKEN_REF = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;

export function isSafeAccentTokenRef(value: string | undefined): value is string {
  return typeof value === 'string' && ACCENT_TOKEN_REF.test(value);
}

/**
 * Maps a semantic token reference to a CSS custom property without turning the
 * token into arbitrary CSS. The actual palette remains theme/deployment-owned.
 */
export function accentCssValue(tokenRef: string | undefined) {
  if (!isSafeAccentTokenRef(tokenRef)) return 'var(--koali-accent, var(--ant-color-primary, #1e6864))';
  const suffix = tokenRef.replace(/[._]/g, '-');
  return `var(--koali-accent-${suffix}, var(--koali-accent, var(--ant-color-primary, #1e6864)))`;
}
