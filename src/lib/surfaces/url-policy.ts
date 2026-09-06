const SAFE_SCHEMES = new Set(['http:', 'https:']);

function isLoopbackIpv4(hostname: string) {
  const parts = hostname.split('.');
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part))) return false;
  const values = parts.map(Number);
  return values.every((value) => value >= 0 && value <= 255) && values[0] === 127;
}

export function isAllowedLocalHostname(hostname: string) {
  const normalized = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  return (
    normalized === 'localhost' ||
    normalized === '::1' ||
    isLoopbackIpv4(normalized) ||
    normalized.endsWith('.localhost') ||
    normalized === 'koali.local' ||
    normalized.endsWith('.koali.local')
  );
}

export function isAllowedLocalOrigin(value: string) {
  try {
    const url = new URL(value);
    return (
      SAFE_SCHEMES.has(url.protocol) &&
      !url.username &&
      !url.password &&
      isAllowedLocalHostname(url.hostname)
    );
  } catch {
    return false;
  }
}

export function normalizeOwnerPath(pathname: string) {
  if (!pathname.startsWith('/') || pathname.startsWith('//') || pathname.includes('\\') || pathname.includes('?') || pathname.includes('#') || /[\u0000-\u001f\u007f]/.test(pathname)) {
    throw new Error('owner path must be an absolute local path');
  }
  const segments = pathname.split('/');
  if (segments.some((segment) => segment === '..' || segment === '.')) {
    throw new Error('owner path traversal rejected');
  }
  return pathname.replace(/\/{2,}/g, '/') || '/';
}

export function ownerPathFromSegments(segments: string[] | undefined) {
  if (!segments?.length) return '/';
  for (const segment of segments) {
    if (!segment || segment === '.' || segment === '..' || segment.includes('/') || segment.includes('\\')) {
      throw new Error('invalid deep-link segment');
    }
    let decoded: string;
    try {
      decoded = decodeURIComponent(segment);
    } catch {
      throw new Error('invalid encoded deep-link segment');
    }
    if (decoded === '.' || decoded === '..' || decoded.includes('/') || decoded.includes('\\') || decoded.includes('?') || decoded.includes('#') || /[\u0000-\u001f\u007f]/.test(decoded)) {
      throw new Error('encoded path traversal rejected');
    }
  }
  return normalizeOwnerPath(`/${segments.join('/')}`);
}

export function isSafeRelativeEmbedBase(value: string) {
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('://')) return false;
  try {
    normalizeOwnerPath(value);
    return true;
  } catch {
    return false;
  }
}

export function validateRegisteredEmbedBase(value: string) {
  if (isSafeRelativeEmbedBase(value)) return normalizeOwnerPath(value).replace(/\/$/, '') || '/';
  if (value.split('/').includes('..') || /[\u0000-\u001f\u007f]/.test(value)) throw new Error('unsafe embed base');
  const url = new URL(value);
  if (!SAFE_SCHEMES.has(url.protocol)) throw new Error('unsupported embed scheme');
  if (url.username || url.password) throw new Error('embed URL userinfo is prohibited');
  if (!isAllowedLocalHostname(url.hostname)) throw new Error('embed origin is not an allowed local Koali origin');
  if (url.search || url.hash) throw new Error('embed base cannot contain query or fragment');
  return url.toString().replace(/\/$/, '');
}

export function joinEmbedTarget(embedBase: string, ownerPath: string) {
  const base = validateRegisteredEmbedBase(embedBase);
  const path = normalizeOwnerPath(ownerPath);
  if (isSafeRelativeEmbedBase(base)) {
    const prefix = base === '/' ? '' : base;
    return `${prefix}${path}`.replace(/\/{2,}/g, '/');
  }
  const url = new URL(base.endsWith('/') ? base : `${base}/`);
  const basePath = url.pathname.replace(/\/$/, '');
  url.pathname = `${basePath}${path}`.replace(/\/{2,}/g, '/');
  url.search = '';
  url.hash = '';
  return url.toString();
}
