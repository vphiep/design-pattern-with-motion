'use client';

import { LOCALES } from '@/lib/i18n/types';
import { cn } from '@/lib/utils/cn';
import { useLocale } from './LocaleProvider';

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, ui } = useLocale();

  return (
    <div
      role="group"
      aria-label={ui.nav.localeSwitcher}
      className={cn('inline-flex border-hairline bg-surface', className)}
    >
      {LOCALES.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            className={cn(
              'px-2 py-1 font-mono text-[11px] uppercase tracking-widest transition-colors',
              active ? 'bg-accent text-bg' : 'text-text-muted hover:bg-bg-elevated hover:text-text'
            )}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
