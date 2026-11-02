'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Compass, Menu, X, Search, Layers } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useProgress } from './ProgressProvider';
import { useLocale } from './LocaleProvider';
import { useSearch } from './SearchProvider';
import { ProgressIndicator } from './ProgressIndicator';
import { LocaleSwitcher } from './LocaleSwitcher';
import { cn } from '@/lib/utils/cn';

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  if (href === '/design-systems') return pathname === '/design-systems';
  if (href === '/patterns') return pathname === '/patterns';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { count, total } = useProgress();
  const { ui } = useLocale();
  const { open: openSearch } = useSearch();
  const [open, setOpen] = useState(false);

  // On the standalone 100vh / 100vw carousel route, the page hosts its own top bar
  if (pathname === '/') {
    return null;
  }

  const isHome = false;

  const navLinks = [
    { href: '/design-systems', label: 'Design Systems' },
    { href: '/patterns', label: ui.nav.patterns },
    { href: '/patterns/creational', label: ui.categories.creational },
    { href: '/patterns/structural', label: ui.categories.structural },
    { href: '/patterns/behavioral', label: ui.categories.behavioral },
    { href: '/playground', label: ui.nav.playground }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-wide items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="group flex items-center gap-2.5" aria-label={ui.nav.homeAria}>
            <span className="grid h-7 w-7 place-items-center rounded-lg border-hairline bg-accent text-bg shadow-sm">
              <Compass size={14} strokeWidth={2} />
            </span>
            <span className="text-display text-base leading-none">
              <span className="font-semibold">Design&nbsp;Patterns</span>
              <span className="mx-1.5 text-text-soft">/</span>
              <span className="italic text-text-muted">visually</span>
            </span>
          </Link>

          {!isHome && (
            <Link
              href="/"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 text-xs border border-border-soft bg-surface/80 hover:border-accent text-text-muted hover:text-text rounded-full transition-all shadow-sm"
              title="Đổi chuyên đề học"
            >
              <Layers size={12} className="text-accent" />
              <span>Đổi chuyên đề</span>
            </Link>
          )}
        </div>

        {/* Show pattern navigation links when inside a learning track */}
        {!isHome && (
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-2.5 py-1 text-sm transition-colors duration-200',
                    active ? 'text-text font-medium' : 'text-text-muted hover:text-text'
                  )}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-2 -bottom-0.5 h-px bg-accent"
                      transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {/* Quick Search Button (Cmd+K) */}
          <button
            type="button"
            onClick={openSearch}
            className={cn(
              'group hidden sm:inline-flex items-center gap-2 border-hairline bg-surface px-3 py-1 text-xs text-text-muted rounded-full',
              'transition-colors duration-200 hover:border-accent hover:text-text'
            )}
            aria-label={ui.search.buttonLabel}
          >
            <Search size={13} className="text-text-soft group-hover:text-accent transition-colors" />
            <span className="font-sans text-xs">{ui.search.buttonLabel}</span>
            <kbd className="ml-1.5 inline-flex items-center gap-0.5 rounded border border-border-soft bg-bg px-1.5 py-0.5 font-mono text-[10px] text-text-soft">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </button>

          {/* Mobile search button */}
          <button
            type="button"
            onClick={openSearch}
            className="inline-flex h-8 w-8 items-center justify-center border-hairline bg-surface text-text-muted hover:text-accent sm:hidden rounded-lg"
            aria-label={ui.search.buttonLabel}
          >
            <Search size={14} />
          </button>

          {!isHome && <ProgressIndicator count={count} total={total} />}
          <LocaleSwitcher />

          {!isHome && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-8 w-8 items-center justify-center border-hairline bg-surface md:hidden rounded-lg"
              aria-label={open ? ui.nav.closeMenu : ui.nav.openMenu}
            >
              {open ? <X size={14} /> : <Menu size={14} />}
            </button>
          )}

          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? ui.nav.switchToLight : ui.nav.switchToDark}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center border-hairline bg-surface rounded-lg',
              'transition-colors duration-200 hover:bg-accent hover:text-bg'
            )}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>

      {!isHome && (
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border-soft md:hidden"
            >
              <ul className="mx-auto max-w-wide px-6 py-3">
                <li>
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 py-2 text-sm text-accent font-medium border-b border-border-soft mb-1"
                  >
                    <Layers size={14} />
                    <span>← Đổi chuyên đề khác</span>
                  </Link>
                </li>
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'block py-2 text-sm',
                        isActive(pathname, link.href)
                          ? 'text-accent font-medium'
                          : 'text-text-muted hover:text-text'
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      )}
    </header>
  );
}
