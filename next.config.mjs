function isLoopbackIpv4(hostname) {
  const parts = hostname.split('.');
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part))) return false;
  const values = parts.map(Number);
  return values.every((value) => value >= 0 && value <= 255) && values[0] === 127;
}

function isAllowedLocalHostname(hostname) {
  const normalized = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  return normalized === 'localhost' || normalized === '::1' || isLoopbackIpv4(normalized) ||
    normalized.endsWith('.localhost') || normalized === 'koali.local' || normalized.endsWith('.koali.local');
}

function configuredFrameSources() {
  const raw = process.env.KOALI_SPACES_FRAME_SRC ?? '';
  const sources = [];
  for (const value of raw.split(/\s+/).filter(Boolean)) {
    try {
      const url = new URL(value);
      if (
        !['http:', 'https:'].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.pathname !== '/' ||
        url.search ||
        url.hash ||
        !isAllowedLocalHostname(url.hostname)
      ) {
        throw new Error('frame source must be an allowed local http(s) origin');
      }
      sources.push(url.origin);
    } catch {
      throw new Error(`Invalid KOALI_SPACES_FRAME_SRC local origin: ${value}`);
    }
  }
  return [...new Set(sources)];
}

const frameSrc = ["'self'", ...configuredFrameSources()].join(' ');
const csp = [
  "default-src 'self'",
  "img-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "font-src 'self'",
  `frame-src ${frameSrc}`,
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  images: { unoptimized: true },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy', value: csp },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'no-referrer' },
      ],
    }];
  },
};
export default nextConfig;
