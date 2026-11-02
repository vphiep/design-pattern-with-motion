/**
 * Client-side locale system. The site is fully static — locale is a purely
 * client-side concern (React context + localStorage), never part of the URL.
 *
 * To add a language: extend `Locale`, add the language to every
 * `LocalizedText` object in `lib/patterns/content/*` and to the UI
 * dictionary in `lib/i18n/ui.ts`. No component changes are required.
 */
export type Locale = 'en' | 'vi';

export const LOCALES: readonly Locale[] = ['en', 'vi'] as const;

export const DEFAULT_LOCALE: Locale = 'en';

/** A piece of copy available in every supported language. */
export type LocalizedText = Record<Locale, string>;

/**
 * Resolve a `LocalizedText` for a locale, falling back to English.
 * Tolerates plain strings so the app degrades gracefully while content
 * is migrated by concurrent workers.
 */
export function pickText(text: LocalizedText | string, locale: Locale): string {
  if (typeof text === 'string') return text;
  return text[locale] ?? text[DEFAULT_LOCALE];
}
