'use client';

import Link from 'next/link';
import { useLocale } from '@/components/LocaleProvider';

export default function NotFound() {
  const { ui } = useLocale();

  return (
    <div className="relative">
      <div className="mx-auto flex min-h-[60vh] max-w-wide flex-col items-start justify-center gap-4 px-6 py-24">
        <p className="caption">{ui.notFound.kicker}</p>
        <h1 className="text-display text-display-xl">
          {ui.notFound.titleLead}{' '}
          <span className="italic text-text-muted">{ui.notFound.titleItalic}</span>
        </h1>
        <p className="max-w-reading text-text-muted">{ui.notFound.copy}</p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/"
            className="border-hairline bg-accent px-4 py-2 text-bg hover:bg-accent-strong"
          >
            {ui.notFound.backToIndex}
          </Link>
          <Link
            href="/patterns"
            className="border-hairline bg-surface px-4 py-2 text-text hover:bg-bg-elevated"
          >
            {ui.notFound.browse}
          </Link>
        </div>
      </div>
    </div>
  );
}
