'use client';

import React from 'react';
import { clsx } from 'clsx';

interface Item {
  id: string;
  title: string;
  summary: string;
}

export function StaggeredCardList({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, idx) => (
        <div
          key={item.id}
          style={{
            animationDelay: `${idx * 75}ms`
          }}
          className={clsx(
            'p-5 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)]',
            'transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg',
            'animate-in fade-in slide-in-from-bottom-2'
          )}
        >
          <h3 className="font-semibold text-lg text-[var(--text)]">{item.title}</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{item.summary}</p>
        </div>
      ))}
    </div>
  );
}
