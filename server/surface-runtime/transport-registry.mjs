const SAFE_SCHEMES = new Set(['http:', 'https:']);

function isLoopbackIpv4(hostname) {
  const parts = hostname.split('.');
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part))) return false;
  const values = parts.map(Number);
  return values.every((value) => value >= 0 && value <= 255) && values[0] === 127;
}

export function isAllowedLocalHostname(hostname) {
  const normalized = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  return normalized === 'localhost' || normalized === '::1' || isLoopbackIpv4(normalized) ||
    normalized.endsWith('.localhost') || normalized === 'koali.local' || normalized.endsWith('.koali.local');
}

function assertLocalPath(value) {
  if (typeof value !== 'string' || !value || !value.startsWith('/') || value.startsWith('//') || value.includes('://') || value.includes('\\') || value.includes('?') || value.includes('#') || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new Error('invalid relative embed base');
  }
  if (value.split('/').some((segment) => segment === '.' || segment === '..')) throw new Error('embed base traversal rejected');
  return value.replace(/\/{2,}/g, '/');
}

export function assertResolvedEmbedBase(value) {
  if (typeof value !== 'string' || !value) throw new Error('embed base must be a non-empty string');
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('://')) return assertLocalPath(value);
  if (value.split('/').includes('..') || /[\u0000-\u001f\u007f]/.test(value)) throw new Error('unsafe embed base');
  const url = new URL(value);
  if (!SAFE_SCHEMES.has(url.protocol)) throw new Error('unsupported embed scheme');
  if (url.username || url.password) throw new Error('embed URL userinfo is prohibited');
  if (!isAllowedLocalHostname(url.hostname)) throw new Error('embed origin is not an allowed local Koali origin');
  if (url.search || url.hash) throw new Error('embed base cannot contain query or fragment');
  return url.origin + url.pathname.replace(/\/$/, '');
}

export function resolveRegisteredTarget(registry, moduleId, transportProfileRef) {
  if (!transportProfileRef) return null;
  const target = registry.resolvedTargets?.find(
    (candidate) => candidate.moduleId === moduleId && candidate.transportProfileRef === transportProfileRef,
  );
  if (!target) return null;
  return { ...target, embedBase: assertResolvedEmbedBase(target.embedBase) };
}
