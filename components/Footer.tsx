'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from './LocaleProvider';

export function Footer() {
  const pathname = usePathname();
  const { ui } = useLocale();

  // On the standalone 100vh / 100vw carousel route, do not render the outer footer
  if (pathname === '/') {
    return null;
  }

  return (
    <footer className="relative z-10 mt-20 border-t border-border-soft bg-bg/40">
      <div className="mx-auto grid max-w-wide grid-cols-1 gap-8 px-6 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-display text-display-sm leading-none">
            Design Patterns<span className="mx-2 text-text-soft">/</span>
            <span className="italic text-text-muted">visually</span>
          </p>
          <p className="mt-3 max-w-reading text-sm text-text-muted">{ui.footer.tagline}</p>
        </div>

        <div>
          <h4 className="caption mb-3">{ui.footer.indexHeading}</h4>
          <ul className="space-y-1.5 text-sm">
            <li>
              <Link href="/patterns" className="text-text-muted hover:text-accent">
                {ui.footer.allPatterns}
              </Link>
            </li>
            <li>
              <Link href="/patterns/creational" className="text-text-muted hover:text-accent">
                {ui.categories.creational}
              </Link>
            </li>
            <li>
              <Link href="/patterns/structural" className="text-text-muted hover:text-accent">
                {ui.categories.structural}
              </Link>
            </li>
            <li>
              <Link href="/patterns/behavioral" className="text-text-muted hover:text-accent">
                {ui.categories.behavioral}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="caption mb-3">{ui.footer.colophonHeading}</h4>
          <ul className="space-y-1.5 text-sm text-text-muted">
            <li>
              {ui.footer.setInPrefix} <span className="text-text">Fraunces</span> &amp; Inter
            </li>
            <li>{ui.footer.codeIn}</li>
            <li>{ui.footer.motionBy}</li>
            <li>{ui.footer.edition}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border-soft">
        <div className="mx-auto flex max-w-wide items-center justify-between px-6 py-3 text-xs text-text-soft">
          <span className="font-mono uppercase tracking-widest">{ui.footer.copyright}</span>
          <span className="font-mono">{ui.footer.version}</span>
        </div>
      </div>
    </footer>
  );
}
