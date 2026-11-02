'use client';

import { PatternCard } from '@/components/PatternCard';
import { useLocale } from '@/components/LocaleProvider';
import { getAllPatterns, CATEGORY_META, CATEGORY_ORDER } from '@/lib/patterns/data';

export function CatalogExperience() {
  const { ui } = useLocale();
  const patterns = getAllPatterns();
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    number: CATEGORY_META[cat].number,
    items: patterns.filter((p) => p.category === cat).sort((a, b) => a.order - b.order)
  }));

  return (
    <div className="relative">
      <header className="border-b border-border-soft">
        <div className="mx-auto max-w-wide px-6 py-16">
          <p className="caption">{ui.catalog.kicker}</p>
          <h1 className="text-display text-display-xl mt-2">
            {ui.catalog.titleLead}{' '}
            <span className="italic text-text-muted">{ui.catalog.titleItalic}</span>
          </h1>
          <p className="mt-4 max-w-reading text-text-muted">{ui.catalog.lede}</p>
        </div>
      </header>

      {grouped.map((g) => (
        <section key={g.category} className="border-b border-border-soft">
          <div className="mx-auto max-w-wide px-6 py-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="caption">{g.number}</p>
                <h2 className="text-display text-display-md mt-1">{ui.categories[g.category]}</h2>
              </div>
              <p className="hidden max-w-md text-sm text-text-muted md:block">
                {ui.categoryPage.meta[g.category].blurb}
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((p, i) => (
                <li key={p.id}>
                  <PatternCard pattern={p} index={i} showCategory={false} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </div>
  );
}
