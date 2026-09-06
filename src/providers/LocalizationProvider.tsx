'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import coreFr from '../../public/localization/koali-spaces.fr-CA.json';
import coreEn from '../../public/localization/koali-spaces.en.json';
import { admittedModules } from '@/lib/registry';
import { isSafeLocalHref } from '@/lib/url-policy';
import { useShell } from './ShellProvider';

type Dictionary = Record<string, string>;
type LocalizationContextValue = {
  locale: 'fr-CA' | 'en';
  t: (key: string | undefined, fallback: string) => string;
};

const LocalizationContext = createContext<LocalizationContextValue>({
  locale: 'fr-CA',
  t: (_key, fallback) => fallback,
});

function localeForDocument(): 'fr-CA' | 'en' {
  if (typeof document === 'undefined') return 'fr-CA';
  return document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'fr-CA';
}

function refMatchesLocale(ref: string, locale: 'fr-CA' | 'en') {
  const normalized = ref.toLowerCase();
  if (locale === 'fr-CA') return normalized.includes('fr-ca') || (!normalized.includes('.en.') && !normalized.includes('/en/'));
  return normalized.includes('.en.') || normalized.includes('/en/') || normalized.endsWith('.en.json');
}

export function LocalizationProvider({ children }: PropsWithChildren) {
  const { state } = useShell();
  const [locale, setLocale] = useState<'fr-CA' | 'en'>('fr-CA');
  const [moduleDictionary, setModuleDictionary] = useState<Dictionary>({});

  useEffect(() => setLocale(localeForDocument()), []);

  useEffect(() => {
    const refs = admittedModules(state)
      .flatMap((manifest) => manifest.localization_refs ?? [])
      .filter((ref) => isSafeLocalHref(ref) && refMatchesLocale(ref, locale));
    const unique = [...new Set(refs)];
    let cancelled = false;
    void Promise.all(
      unique.map(async (ref) => {
        try {
          const response = await fetch(ref, { cache: 'force-cache' });
          if (!response.ok) return {};
          const value = await response.json();
          if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
          return Object.fromEntries(
            Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
          );
        } catch {
          return {};
        }
      }),
    ).then((values) => {
      if (!cancelled) setModuleDictionary(Object.assign({}, ...values));
    });
    return () => { cancelled = true; };
  }, [state, locale]);

  const dictionary = useMemo<Dictionary>(
    () => ({ ...(locale === 'fr-CA' ? coreFr : coreEn), ...moduleDictionary }),
    [locale, moduleDictionary],
  );
  const value = useMemo<LocalizationContextValue>(
    () => ({ locale, t: (key, fallback) => key ? dictionary[key] ?? fallback : fallback }),
    [locale, dictionary],
  );
  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export const useLocalization = () => useContext(LocalizationContext);
