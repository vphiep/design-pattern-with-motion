'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LOCALE,
  LOCALES,
  pickText,
  type Locale,
  type LocalizedText
} from '@/lib/i18n/types';
import { UI, type UIStrings } from '@/lib/i18n/ui';

const STORAGE_KEY = 'dpv-locale';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** UI chrome strings for the current locale. */
  ui: UIStrings;
  /** Resolve a LocalizedText content field for the current locale. */
  tx: (text: LocalizedText) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // SSR and first client render always use the default locale so hydration
  // matches; the stored / detected preference is applied right after mount.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLocale(stored)) {
        setLocaleState(stored);
        return;
      }
    } catch {
      /* ignore */
    }
    // First visit, no stored preference: auto-detect Vietnamese.
    if (navigator.language?.toLowerCase().startsWith('vi')) {
      setLocaleState('vi');
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      ui: UI[locale],
      tx: (text) => pickText(text, locale)
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within <LocaleProvider>');
  return ctx;
}
