'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useLocale } from '@/components/LocaleProvider';
import { ObserverSim } from './ObserverSim';
import { DecoratorSim } from './DecoratorSim';
import { FactorySim } from './FactorySim';
import { StrategySim } from './StrategySim';

const SIMS = [
  { id: 'observer', name: 'Observer' },
  { id: 'decorator', name: 'Decorator' },
  { id: 'factory-method', name: 'Factory Method' },
  { id: 'strategy', name: 'Strategy' }
] as const;

type SimId = (typeof SIMS)[number]['id'];

export function PlaygroundStudio() {
  const { ui } = useLocale();
  const [active, setActive] = useState<SimId>('observer');

  return (
    <div className="relative">
      <header className="border-b border-border-soft">
        <div className="mx-auto max-w-wide px-6 py-16">
          <p className="caption">{ui.playground.kicker}</p>
          <h1 className="text-display text-display-xl mt-2">
            {ui.playground.titleLead}{' '}
            <span className="italic text-text-muted">{ui.playground.titleItalic}</span>
          </h1>
          <p className="mt-4 max-w-reading text-text-muted">{ui.playground.lede}</p>
        </div>
      </header>

      <section className="mx-auto max-w-wide px-6 py-10">
        <div className="mb-6 flex flex-wrap gap-2">
          {SIMS.map((s) => {
            const isSelected = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                className={cn(
                  'relative isolate border-hairline px-3 py-2 text-left transition-colors',
                  isSelected ? 'text-bg' : 'bg-surface text-text hover:bg-bg-elevated'
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activePlaygroundSimTab"
                    className="absolute inset-0 bg-accent -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="block font-mono text-[10px] uppercase tracking-widest opacity-70">
                  {ui.playground.simTag}
                </span>
                <span className="text-display text-sm">{s.name}</span>
              </button>
            );
          })}
        </div>
        <p className="mb-4 text-sm text-text-muted">{ui.playground.blurbs[active]}</p>
        <div className="border-hairline bg-surface overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {active === 'observer' && <ObserverSim />}
              {active === 'decorator' && <DecoratorSim />}
              {active === 'factory-method' && <FactorySim />}
              {active === 'strategy' && <StrategySim />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
