import accentPaletteDocument from '../../interface/appearance/accent-palette.json';
import type { InterfaceTheme, SpaceDefinition } from '@/types/contracts';

export const APPEARANCE_MODES = ['system', 'light', 'dark'] as const;
export const DENSITIES = ['compact', 'comfortable', 'touch'] as const;
export const SURFACE_STYLES = ['minimal', 'outlined', 'elevated'] as const;

export type AppearanceMode = (typeof APPEARANCE_MODES)[number];
export type Density = (typeof DENSITIES)[number];
export type SurfaceStyle = (typeof SURFACE_STYLES)[number];
export type AccentId = string;

type AccentDefinition = { id: string; label: string; color: string };
const accentDefinitions = accentPaletteDocument.accents as AccentDefinition[];

export const ACCENT_PALETTE = Object.freeze(
  Object.fromEntries(
    accentDefinitions.map((accent) => [accent.id, Object.freeze({ ...accent })]),
  ) as Record<string, Readonly<AccentDefinition>>,
);
export const ACCENT_IDS = Object.freeze(accentDefinitions.map((accent) => accent.id));
export const DEFAULT_ACCENT_ID = accentPaletteDocument.default_accent;

if (!ACCENT_PALETTE[DEFAULT_ACCENT_ID]) {
  throw new Error('Koali accent palette default_accent does not resolve');
}

export type UserPresentationPreferences = {
  mode: AppearanceMode;
  accent: AccentId;
  density: Density;
  surfaceStyle: SurfaceStyle;
};

export type EffectiveSpaceAppearancePolicy = {
  defaultMode: AppearanceMode;
  defaultAccent: AccentId;
  defaultDensity: Density;
  defaultSurfaceStyle: SurfaceStyle;
  allowedModes: AppearanceMode[];
  allowedAccents: AccentId[];
  allowedDensities: Density[];
  allowedSurfaceStyles: SurfaceStyle[];
  allowModuleAccent: boolean;
};

export type EffectiveAppearance = UserPresentationPreferences & {
  resolvedMode: 'light' | 'dark';
  accentColor: string;
  allowModuleAccent: boolean;
};

export const PRESENTATION_PREFERENCES_STORAGE_KEY = 'koali.presentation.preferences.v1';

export const DEFAULT_USER_PRESENTATION_PREFERENCES: UserPresentationPreferences = {
  mode: 'system',
  accent: DEFAULT_ACCENT_ID,
  density: 'comfortable',
  surfaceStyle: 'outlined',
};

const isOneOf = <T extends readonly string[]>(values: T, value: unknown): value is T[number] =>
  typeof value === 'string' && (values as readonly string[]).includes(value);

export function isAccentId(value: unknown): value is AccentId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(ACCENT_PALETTE, value);
}

export function accentIdForColor(value: unknown): AccentId | null {
  if (typeof value !== 'string') return null;
  const normalized = value.toLowerCase();
  return ACCENT_IDS.find((id) => ACCENT_PALETTE[id]?.color.toLowerCase() === normalized) ?? null;
}

function themeDefaultAccent(theme: InterfaceTheme | null): AccentId {
  const declared = theme?.tokens.primary_accent_id;
  if (isAccentId(declared)) return declared;
  return accentIdForColor(theme?.tokens.primary_accent) ?? DEFAULT_ACCENT_ID;
}

function themeDefaultDensity(theme: InterfaceTheme | null): Density {
  return isOneOf(DENSITIES, theme?.tokens.density) ? theme.tokens.density : 'comfortable';
}

function uniqueAllowed<T extends string>(
  requested: readonly unknown[] | undefined,
  supported: readonly T[],
): T[] {
  if (!requested?.length) return [...supported];
  const supportedSet = new Set<string>(supported);
  const result = [...new Set(requested.filter((item): item is T => typeof item === 'string' && supportedSet.has(item)))];
  return result.length ? result : supported.length ? [supported[0]] : [];
}

function firstAllowed<T extends string>(preferred: unknown, fallback: T, allowed: readonly T[]): T {
  if (typeof preferred === 'string' && allowed.includes(preferred as T)) return preferred as T;
  if (allowed.includes(fallback)) return fallback;
  return allowed[0] ?? fallback;
}

/**
 * Resolves Space-owned presentation defaults and constraints. Personal choices
 * are deliberately absent from this function.
 *
 * Default precedence is:
 *   explicit appearance_policy -> legacy Space compatibility field ->
 *   InterfaceTheme semantic default -> Koali hard default.
 */
export function resolveSpaceAppearancePolicy(
  space: SpaceDefinition | null,
  theme: InterfaceTheme | null = null,
): EffectiveSpaceAppearancePolicy {
  const policy = space?.appearance_policy;
  const allowedModes = uniqueAllowed(policy?.allowed_modes, APPEARANCE_MODES);
  const allowedAccents = uniqueAllowed(policy?.allowed_accents, ACCENT_IDS);
  const allowedDensities = uniqueAllowed(policy?.allowed_densities, DENSITIES);
  const allowedSurfaceStyles = uniqueAllowed(policy?.allowed_surface_styles, SURFACE_STYLES);
  const defaultThemeAccent = themeDefaultAccent(theme);
  const defaultThemeDensity = themeDefaultDensity(theme);

  return {
    defaultMode: firstAllowed(policy?.default_mode, 'system', allowedModes),
    defaultAccent: firstAllowed(policy?.default_accent, defaultThemeAccent, allowedAccents),
    defaultDensity: firstAllowed(
      policy?.default_density ?? space?.appearance.density,
      defaultThemeDensity,
      allowedDensities,
    ),
    defaultSurfaceStyle: firstAllowed(policy?.default_surface_style, 'outlined', allowedSurfaceStyles),
    allowedModes,
    allowedAccents,
    allowedDensities,
    allowedSurfaceStyles,
    allowModuleAccent:
      policy?.allow_module_accent ?? space?.appearance.allow_module_accent ?? true,
  };
}

export function sanitizeStoredPreferences(value: unknown): UserPresentationPreferences | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (candidate.schema_version !== 1) return null;
  const surfaceStyle = candidate.surfaceStyle ?? candidate.surface_style;
  if (
    !isOneOf(APPEARANCE_MODES, candidate.mode) ||
    !isAccentId(candidate.accent) ||
    !isOneOf(DENSITIES, candidate.density) ||
    !isOneOf(SURFACE_STYLES, surfaceStyle)
  ) {
    return null;
  }
  return {
    mode: candidate.mode,
    accent: candidate.accent,
    density: candidate.density,
    surfaceStyle,
  };
}

export function serializePresentationPreferences(preferences: UserPresentationPreferences) {
  return JSON.stringify({
    schema_version: 1,
    mode: preferences.mode,
    accent: preferences.accent,
    density: preferences.density,
    surface_style: preferences.surfaceStyle,
  });
}

export function parsePresentationPreferences(serialized: string | null) {
  if (!serialized) return null;
  try {
    return sanitizeStoredPreferences(JSON.parse(serialized));
  } catch {
    return null;
  }
}

export function defaultPreferencesForPolicy(
  policy: EffectiveSpaceAppearancePolicy,
): UserPresentationPreferences {
  return {
    mode: policy.defaultMode,
    accent: policy.defaultAccent,
    density: policy.defaultDensity,
    surfaceStyle: policy.defaultSurfaceStyle,
  };
}

export function effectiveUserPreferences(
  preferences: UserPresentationPreferences,
  policy: EffectiveSpaceAppearancePolicy,
): UserPresentationPreferences {
  return {
    mode: firstAllowed(preferences.mode, policy.defaultMode, policy.allowedModes),
    accent: firstAllowed(preferences.accent, policy.defaultAccent, policy.allowedAccents),
    density: firstAllowed(preferences.density, policy.defaultDensity, policy.allowedDensities),
    surfaceStyle: firstAllowed(
      preferences.surfaceStyle,
      policy.defaultSurfaceStyle,
      policy.allowedSurfaceStyles,
    ),
  };
}

export function resolveEffectiveAppearance(
  preferences: UserPresentationPreferences,
  policy: EffectiveSpaceAppearancePolicy,
  systemDark: boolean,
): EffectiveAppearance {
  const effective = effectiveUserPreferences(preferences, policy);
  const resolvedMode = effective.mode === 'system' ? (systemDark ? 'dark' : 'light') : effective.mode;
  return {
    ...effective,
    resolvedMode,
    accentColor: ACCENT_PALETTE[effective.accent]?.color ?? ACCENT_PALETTE[DEFAULT_ACCENT_ID].color,
    allowModuleAccent: policy.allowModuleAccent,
  };
}

export function spaceAllowsModuleAccent(space: SpaceDefinition | null) {
  return resolveSpaceAppearancePolicy(space).allowModuleAccent;
}
