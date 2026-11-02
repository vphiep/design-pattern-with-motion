'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocale } from '@/components/LocaleProvider';

export function CourseSwitcherFab() {
  const pathname = usePathname();
  const { locale } = useLocale();

  // Do not show on the full-screen profile picker root page
  if (pathname === '/') {
    return null;
  }

  const isDatabase = pathname.startsWith('/database');
  const isJavaCore = pathname.startsWith('/java-core');

  const accentColor = isJavaCore ? '#e11d48' : isDatabase ? '#0284c7' : '#e85d04';
  const shadowColor = isJavaCore
    ? 'rgba(225, 29, 72, 0.25)'
    : isDatabase
    ? 'rgba(2, 132, 199, 0.2)'
    : 'rgba(232, 93, 4, 0.2)';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className="fixed bottom-6 right-6 z-50 pointer-events-auto"
    >
      <Link
        href="/"
        className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-border-soft bg-surface/90 backdrop-blur-md text-text shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
        style={{
          boxShadow: `0 10px 25px -5px ${shadowColor}, 0 8px 10px -6px ${shadowColor}`
        }}
        title={locale === 'vi' ? 'Quay về màn hình chọn chuyên đề học' : 'Switch course topic'}
      >
        <span
          className="grid h-7 w-7 place-items-center rounded-full text-white"
          style={{ backgroundColor: accentColor }}
        >
          <Layers size={14} className="group-hover:rotate-12 transition-transform" />
        </span>
        <span className="font-mono text-xs font-bold tracking-wide">
          {locale === 'vi' ? 'Đổi chuyên đề' : 'Switch Course'}
        </span>
      </Link>
    </motion.div>
  );
}
