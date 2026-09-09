'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useLayoutEffect,
  type PropsWithChildren,
} from 'react';
import {
  PRESENTATION_PREFERENCES_STORAGE_KEY,
  defaultPreferencesForPolicy,
  parsePresentationPreferences,
  resolveEffectiveAppearance,
  resolveSpaceAppearancePolicy,
  serializePresentationPreferences,
  type AccentId,
  type AppearanceMode,
  type Density,
  type EffectiveAppearance,
  type EffectiveSpaceAppearancePolicy,
  type SurfaceStyle,
  type UserPresentationPreferences,
} from '@/lib/presentation-preferences';
import { useShell } from './ShellProvider';

type PreferencePatch = Partial<UserPresentationPreferences>;

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

type PresentationPreferencesContextValue = {
  preferences: UserPresentationPreferences;
  effective: EffectiveAppearance;
  policy: EffectiveSpaceAppearancePolicy;
  hydrated: boolean;
  hasPersonalPreferences: boolean;
  update: (patch: PreferencePatch) => void;
  setMode: (value: AppearanceMode) => void;
  setAccent: (value: AccentId) => void;
  setDensity: (value: Density) => void;
  setSurfaceStyle: (value: SurfaceStyle) => void;
  reset: () => void;
};

const defaultPolicy = resolveSpaceAppearancePolicy(null, null);
const defaultPreferences = defaultPreferencesForPolicy(defaultPolicy);
const defaultEffective = resolveEffectiveAppearance(defaultPreferences, defaultPolicy, false);

const PresentationPreferencesContext = createContext<PresentationPreferencesContextValue>({
  preferences: defaultPreferences,
  effective: defaultEffective,
  policy: defaultPolicy,
  hydrated: false,
  hasPersonalPreferences: false,
  update: () => undefined,
  setMode: () => undefined,
  setAccent: () => undefined,
  setDensity: () => undefined,
  setSurfaceStyle: () => undefined,
  reset: () => undefined,
});

function currentSystemDark() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;
}

export function PresentationPreferencesProvider({ children }: PropsWithChildren) {
  const { state } = useShell();
  const [personalPreferences, setPersonalPreferences] = useState<UserPresentationPreferences | null>(null);
  const [systemDark, setSystemDark] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const policy = useMemo(
    () => resolveSpaceAppearancePolicy(state.active_space, state.active_theme),
    [state.active_space, state.active_theme],
  );
  const preferences = useMemo(
    () => personalPreferences ?? defaultPreferencesForPolicy(policy),
    [personalPreferences, policy],
  );
  const effective = useMemo(
    () => resolveEffectiveAppearance(preferences, policy, systemDark),
    [preferences, policy, systemDark],
  );

  useIsomorphicLayoutEffect(() => {
    setSystemDark(currentSystemDark());
    try {
      setPersonalPreferences(
        parsePresentationPreferences(
          window.localStorage.getItem(PRESENTATION_PREFERENCES_STORAGE_KEY),
        ),
      );
    } catch {
      // Local presentation state is optional. Storage failures never affect Space authority.
    } finally {
      // Layout timing keeps the pre-hydration bootstrap and the first resolved
      // Ant token set visually continuous without moving preference authority server-side.
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    setSystemDark(query.matches);
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (personalPreferences) {
        window.localStorage.setItem(
          PRESENTATION_PREFERENCES_STORAGE_KEY,
          serializePresentationPreferences(personalPreferences),
        );
      } else {
        window.localStorage.removeItem(PRESENTATION_PREFERENCES_STORAGE_KEY);
      }
    } catch {
      // Persistence is best-effort and deliberately outside the activated Space state.
    }
  }, [hydrated, personalPreferences]);

  const update = useCallback((patch: PreferencePatch) => {
    setPersonalPreferences((current) => ({
      ...(current ?? defaultPreferencesForPolicy(policy)),
      ...patch,
    }));
  }, [policy]);

  const value = useMemo<PresentationPreferencesContextValue>(
    () => ({
      preferences,
      effective,
      policy,
      hydrated,
      hasPersonalPreferences: personalPreferences !== null,
      update,
      setMode: (mode) => update({ mode }),
      setAccent: (accent) => update({ accent }),
      setDensity: (density) => update({ density }),
      setSurfaceStyle: (surfaceStyle) => update({ surfaceStyle }),
      reset: () => setPersonalPreferences(null),
    }),
    [effective, hydrated, personalPreferences, policy, preferences, update],
  );

  return (
    <PresentationPreferencesContext.Provider value={value}>
      {children}
    </PresentationPreferencesContext.Provider>
  );
}

export const usePresentationPreferences = () => useContext(PresentationPreferencesContext);
