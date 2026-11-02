# Architecture — Design Patterns, Visually

Editorial Next.js (App Router) site. Frontend only. No database, no API routes.

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind with the tokens in `app/globals.css` / `tailwind.config.ts`
- GSAP + ScrollTrigger for choreographed scenes
- Motion (framer-motion) for micro-interactions and route fades
- Shiki for Java highlighting
- HTML5 Canvas for the playground sims

## Content model

`lib/patterns/types.ts` defines `Pattern`:

- Chrome-stable English identifiers: `id`, `name`, `javaCode`
- Localized copy as `LocalizedText = { en: string; vi: string }`: `tagline`, `analogy`, `whenToUse[]`, `whenNotToUse[]`
- `steps: PatternStep[]` — numbered “How it works” walkthrough (`title` + 2–4 sentence `body`). Index-aligned with `SCENE_META[id].steps` (same count, same order)
- `realSystems: RealSystemNote[]` — 2–3 verified APIs (`system` stays English; `note` is localized)
- Optional `advanced?: PatternAdvanced` — `whatMakesItAdvanced`, `tradeoffs`, and a separate `javaCode`. Shown behind a Standard | Advanced toggle, never appended

Canonical records live in `lib/patterns/content/{id}.ts` and are assembled by `lib/patterns/content/index.ts`.

`lib/patterns/data.ts` is the query layer: `getAllPatterns`, `getPatternById`, `getPatternsByCategory`, `getAdjacentPatterns`, `CATEGORY_META` (Roman numerals only). `lib/patterns/data.generated.ts` re-exports `allPatterns` for older illustration-worker imports.

Progress is a `Set` of pattern ids in `localStorage` (`dpv-progress`) via `ProgressProvider`.

## i18n

Client-only. No locale in the URL, no full reload on switch.

- `lib/i18n/types.ts` — `Locale`, `LocalizedText`, `pickText()`
- `lib/i18n/ui.ts` — typed `UIStrings` dictionary (nav, footer, home, catalog, category, pattern chrome, playground, 404, code block)
- `components/LocaleProvider.tsx` — React context, `localStorage` key `dpv-locale`, `<html lang>`
- `components/LocaleSwitcher.tsx` — persistent EN | VI control in the header

Default locale is English. First visit with no stored preference and `navigator.language` starting with `vi` → Vietnamese. SSR and the first client paint always use English so hydration matches; the preference applies immediately after mount.

Components call `useLocale()` for `{ locale, setLocale, ui, tx }`. `tx(text)` resolves a `LocalizedText` field. Pattern names and Java identifiers stay English in every locale.

Vietnamese copy is developer-Vietnamese: keep terms Vietnamese engineers already say in English (`interface`, `class`, `constructor`, `instance`, `override`, `callback`, `subclass`).

Replay / pause labels on the illustration stage are still English (deferred). Scene captions in `scene-meta.ts` stay English.

Server `generateMetadata` uses English via `pickText(..., 'en')`.

## Pages

| Route                                              | Role                                                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `/`                                                | GSAP hero + atlas of all 23 (`HomeExperience`)                                                               |
| `/patterns`                                        | Catalog grouped by category (`CatalogExperience`)                                                            |
| `/patterns/creational` `/structural` `/behavioral` | Category overview + motif                                                                                    |
| `/patterns/[id]`                                   | Definition, illustration, numbered walkthrough, analogy, when/not, real systems, Java (Standard \| Advanced) |
| `/playground`                                      | Interactive Observer / Decorator / Factory Method / Strategy                                                 |

## Illustrations

Each pattern has an encapsulated SVG+GSAP scene:

```
components/illustrations/{id}.tsx
```

IDs match the pattern id (`factory-method.tsx`, `chain-of-responsibility.tsx`, …).

Shared pieces:

- `components/illustrations/shared/SceneBoard.tsx` — SVG frame
- `components/illustrations/shared/primitives.tsx` — boxes, circles, arrows
- `components/illustrations/shared/useSceneTimeline.ts` — replay / pause / seek / step labels
- `lib/patterns/scene.ts` — `SceneProps`, line matching
- `lib/patterns/scene-meta.ts` — captions + step → Java `match` strings
- `lib/patterns/illustrations.ts` — static registry (`id → component`)

`IllustrationStage` mounts the scene inside `PatternCanvas` (replay, pause, step chips). Step chips prefer localized `pattern.steps[i].title`. `PatternPageShell` highlights matching Java lines when a step is active or hovered. The illustration always stays keyed to the **standard** `javaCode`, even when Advanced is selected.

Convention: timelines add labels `step-0`, `step-1`, `step-2`. SVG nodes that belong to a step use `data-step="0,2"`.

Do not change `SCENE_META` step **count** or **order** — illustrations animate against that sequence. Deepen walkthrough text in `content/*`, not by inserting or reordering scene steps. Every `match` string must still occur in that pattern’s standard `javaCode`.

## Advanced variants

Present only when the pattern has a meaningfully different production form:

| Pattern                 | Advanced form                                    |
| ----------------------- | ------------------------------------------------ |
| Singleton               | Initialization-on-demand holder + enum singleton |
| Factory Method          | `Supplier` registry                              |
| Builder                 | Staged (wizard) builder                          |
| Decorator               | `Function.andThen` composition                   |
| Flyweight               | `ConcurrentHashMap` intern                       |
| Proxy                   | JDK `Proxy.newProxyInstance`                     |
| Chain of Responsibility | Functional handler pipeline                      |
| Command                 | Undo stack                                       |
| Observer                | `CopyOnWriteArrayList` + `PropertyChangeSupport` |
| Strategy                | Lambda strategies                                |
| Template Method         | Lambda hooks                                     |
| State                   | Enum state machine                               |
| Iterator                | `Spliterator`                                    |
| Visitor                 | Sealed types + exhaustive `switch`               |

Omitted (no distinct advanced code worth a second pane): Abstract Factory, Prototype, Adapter, Bridge, Composite, Facade, Interpreter, Mediator, Memento.

`PatternCard` shows an Advanced badge when `pattern.advanced` is set.

## How to add a pattern

1. Add `lib/patterns/content/{id}.ts` exporting a `Pattern` and register it in `content/index.ts`.
2. Add `SCENE_META[id]` in `lib/patterns/scene-meta.ts` (caption + steps with `match` snippets that exist in the standard Java).
3. Create `components/illustrations/{id}.tsx`:
   - default-export a client component that takes `SceneProps`
   - `useSceneTimeline` + `SceneBoard`
   - add `step-N` labels in the timeline
4. Register it in `lib/patterns/illustrations.ts`.
5. Optionally extend `MiniPreview` for the atlas hover loop.
6. Add UI chrome strings to both locales in `lib/i18n/ui.ts` if you introduce new chrome.

Do not introduce a backend. Keep the editorial tokens (orange is accent only). Respect `prefers-reduced-motion` — the timeline hook jumps to the end state.

## Playground

`lib/canvas/useCanvas.ts` sizes a canvas with DPR (the CSS box drives the size — never write inline width/height), reads CSS variables for theme colors and fonts, and paints on `requestAnimationFrame`: once after a size, theme, or deps change, then every frame while `draw` returns `true`. Under reduced motion it paints one frame and sims draw their end state (`progress()` returns 1). Helpers: `progress`, `easeInOut`, `easeOut`, `lerp`, `approach` (frame-rate independent), `fitText`.

Sims live in `components/playground/`. Chrome strings (buttons, hints) come from `ui.playground`.
