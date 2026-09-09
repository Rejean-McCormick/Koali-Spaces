import { describe, expect, it } from 'vitest';
import {
  DEFAULT_USER_PRESENTATION_PREFERENCES,
  defaultPreferencesForPolicy,
  effectiveUserPreferences,
  parsePresentationPreferences,
  resolveEffectiveAppearance,
  resolveSpaceAppearancePolicy,
  serializePresentationPreferences,
} from '@/lib/presentation-preferences';
import type { InterfaceTheme, SpaceDefinition } from '@/types/contracts';

function space(overrides: Partial<SpaceDefinition> = {}): SpaceDefinition {
  return {
    space_id: 'test_space',
    title: 'Test Space',
    version: '1.0.0',
    default_module_id: 'space_home',
    module_instances: [],
    global_topbar: [],
    appearance: {
      theme_ref: 'themes/default.json',
      density: 'touch',
      allow_module_accent: false,
    },
    offline_policy: {
      shell_available: true,
      retain_last_validated_definition: true,
      unavailable_module_behavior: 'show_unavailable',
      network_state_indicator: true,
      public_cdn_required: false,
      remote_runtime_assets_required: false,
    },
    authority_boundary: {},
    ...overrides,
  };
}


function interfaceTheme(overrides: Partial<InterfaceTheme['tokens']> = {}): InterfaceTheme {
  return {
    theme_id: 'koa_spaces.test',
    version: '1.0.0',
    design_system_id: 'koali.ant5',
    tokens: {
      primary_accent: '#2563eb',
      primary_accent_id: 'ocean',
      density: 'compact',
      radius_scale: 'v1',
      spacing_scale: 'v1',
      typography_scale: 'v1',
      focus_style: 'visible',
      ...overrides,
    },
  };
}

describe('presentation preference authority', () => {
  it('treats legacy Space density/module accent as defaults and constraints, not personal state', () => {
    const policy = resolveSpaceAppearancePolicy(space());
    expect(policy.defaultDensity).toBe('touch');
    expect(policy.allowModuleAccent).toBe(false);
    expect(policy.defaultMode).toBe('system');
    expect(policy.defaultSurfaceStyle).toBe('outlined');
  });

  it('enforces Space allowed values without mutating the stored personal preference', () => {
    const policy = resolveSpaceAppearancePolicy(space({
      appearance_policy: {
        default_mode: 'light',
        default_accent: 'forest',
        default_density: 'comfortable',
        default_surface_style: 'minimal',
        allowed_modes: ['light'],
        allowed_accents: ['forest'],
        allowed_densities: ['comfortable'],
        allowed_surface_styles: ['minimal'],
      },
    }));
    const personal = {
      mode: 'dark',
      accent: 'ocean',
      density: 'compact',
      surfaceStyle: 'elevated',
    } as const;
    expect(effectiveUserPreferences(personal, policy)).toEqual({
      mode: 'light',
      accent: 'forest',
      density: 'comfortable',
      surfaceStyle: 'minimal',
    });
    expect(personal.mode).toBe('dark');
  });

  it('round-trips device-local preference serialization independently of Space state', () => {
    const serialized = serializePresentationPreferences({
      mode: 'dark',
      accent: 'plum',
      density: 'compact',
      surfaceStyle: 'elevated',
    });
    expect(parsePresentationPreferences(serialized)).toEqual({
      mode: 'dark',
      accent: 'plum',
      density: 'compact',
      surfaceStyle: 'elevated',
    });
    expect(parsePresentationPreferences('{"mode":"invalid"}')).toBeNull();
    expect(parsePresentationPreferences('{"schema_version":2,"mode":"dark","accent":"forest","density":"comfortable","surface_style":"outlined"}')).toBeNull();
  });

  it('uses Space defaults when no personal preference exists', () => {
    const policy = resolveSpaceAppearancePolicy(space());
    const defaults = defaultPreferencesForPolicy(policy);
    expect(defaults.density).toBe('touch');
    expect(resolveEffectiveAppearance(defaults, policy, false).density).toBe('touch');
  });

  it('uses InterfaceTheme semantic defaults when the new Space omits legacy density/default accent', () => {
    const value = space({
      appearance: { theme_ref: 'themes/test.json' },
      appearance_policy: undefined,
    });
    const policy = resolveSpaceAppearancePolicy(value, interfaceTheme());
    expect(policy.defaultAccent).toBe('ocean');
    expect(policy.defaultDensity).toBe('compact');
  });

  it('keeps explicit policy and legacy Space density ahead of InterfaceTheme fallbacks', () => {
    const value = space({
      appearance: { theme_ref: 'themes/test.json', density: 'touch' },
      appearance_policy: { default_accent: 'plum' },
    });
    const policy = resolveSpaceAppearancePolicy(value, interfaceTheme());
    expect(policy.defaultAccent).toBe('plum');
    expect(policy.defaultDensity).toBe('touch');
  });

  it('resolves system mode without changing the personal mode value', () => {
    const policy = resolveSpaceAppearancePolicy(null, null);
    const light = resolveEffectiveAppearance(DEFAULT_USER_PRESENTATION_PREFERENCES, policy, false);
    const dark = resolveEffectiveAppearance(DEFAULT_USER_PRESENTATION_PREFERENCES, policy, true);
    expect(light.mode).toBe('system');
    expect(light.resolvedMode).toBe('light');
    expect(dark.mode).toBe('system');
    expect(dark.resolvedMode).toBe('dark');
  });
});
