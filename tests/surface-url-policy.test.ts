import { describe, expect, it } from 'vitest';
import {
  isAllowedLocalOrigin,
  joinEmbedTarget,
  ownerPathFromSegments,
  validateRegisteredEmbedBase,
} from '@/lib/surfaces/url-policy';

describe('surface URL policy', () => {
  it('joins an admitted base and owner path without forwarding query state', () => {
    expect(joinEmbedTarget('http://127.0.0.1:4000/app', '/ethikos')).toBe('http://127.0.0.1:4000/app/ethikos');
    expect(joinEmbedTarget('/__apps/konnaxion', '/ethikos')).toBe('/__apps/konnaxion/ethikos');
  });

  it('accepts only relative, loopback, or Koali-local registered origins', () => {
    expect(isAllowedLocalOrigin('http://127.0.0.1:4000')).toBe(true);
    expect(isAllowedLocalOrigin('http://localhost:4000')).toBe(true);
    expect(isAllowedLocalOrigin('https://konnaxion.apps.koali.local')).toBe(true);
    expect(isAllowedLocalOrigin('https://example.com')).toBe(false);
    expect(() => validateRegisteredEmbedBase('https://example.com/app')).toThrow();
  });

  it('rejects userinfo and unsafe protocols', () => {
    expect(() => validateRegisteredEmbedBase('file:///tmp/app')).toThrow();
    expect(() => validateRegisteredEmbedBase('http://user:pass@127.0.0.1:4000')).toThrow();
  });

  it('rejects encoded traversal segments', () => {
    expect(() => ownerPathFromSegments(['%2e%2e', 'x'])).toThrow();
  });
});
