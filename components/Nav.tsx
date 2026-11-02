'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Compass,
  Menu,
  X,
  Search,
  Database,
  Layers,
  Play,
  Cpu
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useProgress } from './ProgressProvider';
import { useLocale } from './LocaleProvider';
import { useSearch } from './SearchProvider';
import { ProgressIndicator } from './ProgressIndicator';
import { LocaleSwitcher } from './LocaleSwitcher';
import { cn } from '@/lib/utils/cn';

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  if (href === '/database') return pathname === '/database';
  if (href === '/java-core') return pathname === '/java-core';
  if (href === '/design-systems') return pathname === '/design-systems';
  if (href === '/patterns') return pathname === '/patterns';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { count, total } = useProgress();
  const { ui, locale } = useLocale();
  const { open: openSearch } = useSearch();
  const [open, setOpen] = useState(false);

  // Standalone full-screen course picker route
  if (pathname === '/') {
    return null;
  }

  const isDatabaseCourse = pathname.startsWith('/database');
  const isJavaCoreCourse = pathname.startsWith('/java-core');
  const isMessagingCourse = pathname.startsWith('/message-queue');

  interface NavLinkItem {
    href: string;
    label: string;
    isHighlight?: boolean;
  }

  // Streamlined, clean navigation links (no overflowing)
  const messagingNavLinks: NavLinkItem[] = [
    { href: '/message-queue', label: locale === 'vi' ? 'Tổng quan' : 'Overview' },
    { href: '/message-queue#curriculum', label: locale === 'vi' ? '20 Bài học' : 'Curriculum' },
    { href: '/message-queue/playground', label: locale === 'vi' ? 'Lab Phân tán' : 'Live Simulator', isHighlight: true }
  ];

  const javaCoreNavLinks: NavLinkItem[] = [
    { href: '/java-core', label: locale === 'vi' ? 'Tổng quan' : 'Overview' },
    { href: '/java-core/jvm-memory-model', label: 'JVM Memory' },
    { href: '/java-core/virtual-threads', label: 'Virtual Threads', isHighlight: true }
  ];

  const databaseNavLinks: NavLinkItem[] = [
    { href: '/database', label: locale === 'vi' ? 'Tổng quan' : 'Overview' },
    { href: '/database#curriculum', label: locale === 'vi' ? '12 Chủ đề' : 'Curriculum' },
    { href: '/database/playground', label: locale === 'vi' ? 'Lab Mô phỏng' : 'Live Simulator', isHighlight: true }
  ];

  const designPatternNavLinks: NavLinkItem[] = [
    { href: '/design-systems', label: 'Design Systems' },
    { href: '/patterns', label: ui.nav.patterns },
    { href: '/patterns/creational', label: ui.categories.creational },
    { href: '/patterns/structural', label: ui.categories.structural },
    { href: '/patterns/behavioral', label: ui.categories.behavioral },
    { href: '/playground', label: ui.nav.playground }
  ];

  const currentNavLinks = isMessagingCourse
    ? messagingNavLinks
    : isJavaCoreCourse
    ? javaCoreNavLinks
    : isDatabaseCourse
    ? databaseNavLinks
    : designPatternNavLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-wide items-center justify-between gap-6 px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4 shrink-0">
          {isMessagingCourse ? (
            <Link
              href="/message-queue"
              className="group flex items-center gap-2.5"
              aria-label="Distributed Messaging & Streaming"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-400 shadow-sm transition-transform group-hover:scale-105">
                <Layers size={16} strokeWidth={2.2} />
              </span>
              <span className="text-display text-base leading-none">
                <span className="font-bold tracking-tight text-text">Kafka vs RabbitMQ</span>
                <span className="mx-1.5 text-text-soft">/</span>
                <span className="font-mono text-xs uppercase tracking-wider text-purple-400">Streaming</span>
              </span>
            </Link>
          ) : isJavaCoreCourse ? (
            <Link
              href="/java-core"
              className="group flex items-center gap-2.5"
              aria-label="Java Core & JVM Internals"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-500 shadow-sm transition-transform group-hover:scale-105">
                <Cpu size={16} strokeWidth={2.2} />
              </span>
              <span className="text-display text-base leading-none">
                <span className="font-bold tracking-tight text-text">Java Core</span>
                <span className="mx-1.5 text-text-soft">/</span>
                <span className="font-mono text-xs uppercase tracking-wider text-rose-500">JVM</span>
              </span>
            </Link>
          ) : isDatabaseCourse ? (
            <Link
              href="/database"
              className="group flex items-center gap-2.5"
              aria-label="Database Internals & Storage Architecture"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-sky-500/40 bg-sky-500/10 text-sky-400 shadow-sm transition-transform group-hover:scale-105">
                <Database size={16} strokeWidth={2.2} />
              </span>
              <span className="text-display text-base leading-none">
                <span className="font-bold tracking-tight text-text">Database</span>
                <span className="mx-1.5 text-text-soft">/</span>
                <span className="font-mono text-xs uppercase tracking-wider text-sky-400">Internals</span>
              </span>
            </Link>
          ) : (
            <Link href="/design-systems" className="group flex items-center gap-2.5" aria-label={ui.nav.homeAria}>
              <span className="grid h-8 w-8 place-items-center rounded-lg border-hairline bg-accent text-bg shadow-sm transition-transform group-hover:scale-105">
                <Compass size={16} strokeWidth={2} />
              </span>
              <span className="text-display text-base leading-none">
                <span className="font-semibold text-text">Design&nbsp;Patterns</span>
                <span className="mx-1.5 text-text-soft">/</span>
                <span className="italic text-text-muted">visually</span>
              </span>
            </Link>
          )}
        </div>

        {/* Desktop Course-specific Navigation (Clean, Spacious) */}
        <nav className="hidden items-center gap-2 md:flex">
          {currentNavLinks.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-3 py-1.5 text-xs font-mono transition-colors duration-200 rounded-md',
                  link.isHighlight
                    ? isMessagingCourse
                      ? 'border border-purple-500/40 bg-purple-500/10 text-purple-400 font-bold hover:bg-purple-500/20'
                      : isJavaCoreCourse
                      ? 'border border-rose-500/40 bg-rose-500/10 text-rose-500 font-bold hover:bg-rose-500/20'
                      : 'border border-sky-500/40 bg-sky-500/10 text-sky-400 font-bold hover:bg-sky-500/20'
                    : active
                    ? 'text-text font-bold bg-surface'
                    : 'text-text-muted hover:text-text hover:bg-surface/50'
                )}
              >
                {link.label}
                {active && !link.isHighlight && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className={cn(
                      'absolute bottom-0 left-3 right-3 h-[2px]',
                      isMessagingCourse ? 'bg-purple-400' : isJavaCoreCourse ? 'bg-rose-500' : isDatabaseCourse ? 'bg-sky-400' : 'bg-accent'
                    )}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          {!isDatabaseCourse && !isJavaCoreCourse && !isMessagingCourse && (
            <div className="hidden lg:block">
              <ProgressIndicator count={count} total={total} />
            </div>
          )}

          <button
            type="button"
            onClick={openSearch}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border-soft bg-surface/60 text-text-muted transition-colors hover:border-border hover:text-text"
            aria-label={ui.search.placeholder}
            title={locale === 'vi' ? 'Tìm kiếm (⌘K / Ctrl+K)' : 'Search (⌘K / Ctrl+K)'}
          >
            <Search size={15} />
          </button>

          <LocaleSwitcher />

          <button
            type="button"
            onClick={toggle}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border-soft bg-surface/60 text-text-muted transition-colors hover:border-border hover:text-text"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border-soft bg-surface/60 text-text-muted hover:text-text md:hidden"
            aria-label="Toggle navigation menu"
          >
            {open ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border-soft bg-bg/95 backdrop-blur-md px-6 py-4 md:hidden"
          >
            <div className="flex flex-col gap-1.5">
              {currentNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'py-2 px-3 rounded-lg text-sm font-mono transition-colors',
                    isActive(pathname, link.href)
                      ? 'bg-surface font-bold text-text'
                      : 'text-text-muted hover:text-text hover:bg-surface/50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
