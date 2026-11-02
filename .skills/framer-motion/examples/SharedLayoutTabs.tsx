'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
}

interface SharedLayoutTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (id: string) => void;
}

export function SharedLayoutTabs({ tabs, defaultTab, onChange }: SharedLayoutTabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  const handleSelect = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div className="inline-flex p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-soft)]">
      {tabs.map((tab) => {
        const isSelected = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            className="relative px-4 py-2 text-sm font-medium transition-colors z-10"
            style={{
              color: isSelected ? 'var(--text)' : 'var(--text-muted)'
            }}
          >
            {isSelected && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-[var(--surface)] rounded-lg shadow-sm -z-10"
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 32
                }}
              />
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
