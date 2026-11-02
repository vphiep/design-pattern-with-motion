'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface Term {
  term: string;
  short: string;
  long: string;
}

const terms: Term[] = [
  {
    term: 'interface',
    short: 'A contract',
    long: 'A type that lists method signatures a class must implement. It says what something does, not how.'
  },
  {
    term: 'concrete class',
    short: 'A real class',
    long: 'A class that can be instantiated, as opposed to an abstract class or interface. It provides full implementations of its methods.'
  },
  {
    term: 'polymorphism',
    short: 'Many forms',
    long: 'The ability to treat objects of different classes through a common interface, with each class providing its own behavior.'
  },
  {
    term: 'encapsulation',
    short: 'Hiding internals',
    long: 'Keeping an object’s internal state private and exposing a small public surface — so callers depend on behavior, not data.'
  },
  {
    term: 'inheritance',
    short: 'Reuse via “is-a”',
    long: 'A class that extends another and inherits its fields and methods. Use sparingly; composition is often more flexible.'
  },
  {
    term: 'composition',
    short: 'Reuse via “has-a”',
    long: 'Building a class out of other classes it holds as fields. Lets you swap behavior at runtime without subclassing.'
  },
  {
    term: 'subclass',
    short: 'A child class',
    long: 'A class that extends a parent class. It inherits everything reachable and can override methods.'
  },
  {
    term: 'tight coupling',
    short: 'Hard-wired',
    long: 'When two pieces of code know about each other’s concrete details. Changes ripple; reuse is hard.'
  },
  {
    term: 'client',
    short: 'The caller',
    long: 'The code that uses an object or service. Good design lets the client depend on abstractions, not implementations.'
  },
  {
    term: 'subject',
    short: 'The publisher',
    long: 'In Observer, the object that holds a list of interested listeners and notifies them when something changes.'
  },
  {
    term: 'observer',
    short: 'The subscriber',
    long: 'In Observer, an object that registers with a subject and is told when the subject changes.'
  },
  {
    term: 'refactor',
    short: 'Restructure, no behavior change',
    long: 'Rewriting code to improve its structure while keeping observable behavior identical.'
  }
];

export function getTerm(name: string): Term | undefined {
  return terms.find((t) => t.term === name);
}

export function Glossary({ className }: { className?: string }) {
  return (
    <ul className={cn('grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {terms.map((t) => (
        <li key={t.term}>
          <GlossaryTerm term={t}>{t.term}</GlossaryTerm>
        </li>
      ))}
    </ul>
  );
}

export function GlossaryTerm({
  term,
  children,
  className
}: {
  term: string | Term;
  children?: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const t: Term | undefined = typeof term === 'string' ? getTerm(term) : term;
  if (!t) {
    const fallback = children ?? (typeof term === 'string' ? term : null);
    return <span className={className}>{fallback}</span>;
  }

  return (
    <span
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        className="cursor-help border-b border-dashed border-accent text-text transition-colors hover:text-accent"
        aria-describedby={`glossary-${t.term}`}
      >
        {children ?? t.term}
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            id={`glossary-${t.term}`}
            role="tooltip"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
            className="pointer-events-none absolute left-0 top-full z-30 mt-2 block w-64 border-hairline bg-surface p-3 text-left text-xs text-text shadow-editorial dark:shadow-editorial-dark"
          >
            <strong className="block font-display text-sm text-text">
              {t.term}
              <span className="ml-2 text-text-soft">— {t.short}</span>
            </strong>
            <span className="mt-1 block text-text-muted">{t.long}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
