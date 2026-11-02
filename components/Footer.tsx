'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Database, Server, Cpu, Layers, GitFork, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { useLocale } from './LocaleProvider';

export function Footer() {
  const pathname = usePathname();
  const { ui, locale } = useLocale();

  // On the standalone full-screen course picker route, do not render the outer footer
  if (pathname === '/') {
    return null;
  }

  const isDatabaseCourse = pathname.startsWith('/database');

  if (isDatabaseCourse) {
    return (
      <footer className="relative z-10 mt-24 border-t border-border-soft bg-surface/30 backdrop-blur-md">
        <div className="mx-auto grid max-w-wide grid-cols-1 gap-10 px-6 py-12 md:grid-cols-12">
          {/* Col 1: Brand & Architecture Mission */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-sky-500/40 bg-sky-500/10 text-sky-400">
                <Database size={16} strokeWidth={2.2} />
              </span>
              <p className="text-display text-lg font-bold leading-none text-text">
                Database Internals<span className="mx-1.5 text-text-soft">/</span>
                <span className="font-mono text-xs uppercase tracking-wider text-sky-400">Storage</span>
              </p>
            </div>
            <p className="text-xs text-text-soft leading-relaxed max-w-sm">
              {locale === 'vi'
                ? 'Nền tảng trực quan hóa chuyên sâu về kiến trúc đĩa cứng, cấu trúc trang bộ nhớ (Slotted Page), bộ đệm Buffer Pool, cô lập giao dịch MVCC và thuật toán phục hồi sự cố ARIES.'
                : 'Interactive visual deconstruction of storage engines, memory page layouts, buffer pool replacement algorithms, MVCC snapshot isolation, and ARIES crash recovery.'}
            </p>
            <div className="pt-2">
              <Link
                href="/database/playground"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-400 hover:text-sky-300 font-semibold"
              >
                <span>{locale === 'vi' ? 'Thử nghiệm B+ Tree & Clock Simulator →' : 'Launch Interactive Simulator →'}</span>
              </Link>
            </div>
          </div>

          {/* Col 2: Storage & Indexing */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="caption text-sky-400 font-mono text-xs uppercase tracking-wider font-bold">
              {locale === 'vi' ? 'Lưu trữ & Chỉ mục' : 'Storage & Indexing'}
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/database/b-tree" className="text-text-muted hover:text-sky-400 transition-colors">
                  B+ Tree Index &amp; Page Split
                </Link>
              </li>
              <li>
                <Link href="/database/slotted-page" className="text-text-muted hover:text-sky-400 transition-colors">
                  Slotted Page &amp; Tuple Layout
                </Link>
              </li>
              <li>
                <Link href="/database/lsm-tree" className="text-text-muted hover:text-sky-400 transition-colors">
                  LSM-Tree &amp; SSTable Compaction
                </Link>
              </li>
              <li>
                <Link href="/database/columnar-storage" className="text-text-muted hover:text-sky-400 transition-colors">
                  Columnar Storage &amp; Vectorization
                </Link>
              </li>
              <li>
                <Link href="/database/heap-toast" className="text-text-muted hover:text-sky-400 transition-colors">
                  Heap Files &amp; TOAST Pages
                </Link>
              </li>
              <li>
                <Link href="/database/hash-index" className="text-text-muted hover:text-sky-400 transition-colors">
                  Extendible Hash Indexing
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Concurrency & Durability */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="caption text-purple-400 font-mono text-xs uppercase tracking-wider font-bold">
              {locale === 'vi' ? 'Đồng thời & Bền vững' : 'Concurrency & Durability'}
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/database/mvcc-isolation" className="text-text-muted hover:text-purple-400 transition-colors">
                  MVCC &amp; Snapshot Isolation
                </Link>
              </li>
              <li>
                <Link href="/database/acid-anomalies" className="text-text-muted hover:text-purple-400 transition-colors">
                  ACID &amp; Isolation Anomalies
                </Link>
              </li>
              <li>
                <Link href="/database/two-phase-locking" className="text-text-muted hover:text-purple-400 transition-colors">
                  Strict 2PL &amp; Deadlock Detection
                </Link>
              </li>
              <li>
                <Link href="/database/write-ahead-log" className="text-text-muted hover:text-purple-400 transition-colors">
                  Write-Ahead Log (WAL) &amp; LSN
                </Link>
              </li>
              <li>
                <Link href="/database/buffer-pool" className="text-text-muted hover:text-purple-400 transition-colors">
                  Buffer Pool &amp; Clock Eviction
                </Link>
              </li>
              <li>
                <Link href="/database/aries-recovery" className="text-text-muted hover:text-purple-400 transition-colors">
                  ARIES Recovery (Redo/Undo)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Engine References & Switch Track */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="caption text-text font-mono text-xs uppercase tracking-wider font-bold">
              {locale === 'vi' ? 'Chuyển Chuyên đề' : 'Learning Tracks'}
            </h4>
            <div className="space-y-2 text-xs">
              <Link
                href="/design-systems"
                className="flex items-center gap-1.5 text-text-muted hover:text-accent font-mono transition-colors"
              >
                <span>Design Patterns (23 GoF)</span>
                <ArrowRight size={12} />
              </Link>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-text-muted hover:text-text font-mono transition-colors"
              >
                <span>{locale === 'vi' ? 'Tất cả các khóa học' : 'All Available Tracks'}</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="pt-4 border-t border-border-soft">
              <span className="text-[10px] font-mono text-text-soft block mb-1">REAL ENGINES</span>
              <p className="text-[11px] font-mono text-text-muted">
                Postgres 16 · MySQL InnoDB 8.4 · RocksDB 8.10 · SQLite 3
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border-soft">
          <div className="mx-auto flex max-w-wide items-center justify-between px-6 py-4 text-xs text-text-soft">
            <span className="font-mono uppercase tracking-widest text-[11px]">
              Database Architecture Internals Lab · Pure Java 21 Code
            </span>
            <span className="font-mono text-[11px]">v2.0.0 · Storage Release</span>
          </div>
        </div>
      </footer>
    );
  }

  // Default Design Patterns Footer
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
            <li>
              <Link href="/" className="text-accent hover:underline flex items-center gap-1 font-mono text-xs mt-2">
                <span>{locale === 'vi' ? 'Đổi chuyên đề học' : 'Switch Course'}</span>
                <ArrowRight size={12} />
              </Link>
            </li>
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
