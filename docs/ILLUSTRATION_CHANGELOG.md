# Illustration QA changelog

Audit of all 23 pattern scenes, `MiniPreview`, `PatternCanvas`, and `ReplayButton`.
Scenes that already worked were not rebuilt — only targeted fixes.

## Systemic fixes

- **`useSceneTimeline`**: every scene builds inside `gsap.context()` and `ctx.revert()` on unmount / replay. Replay increments `replayNonce` so the timeline is torn down and rebuilt from the true initial state (no transform/opacity drift). Rapid seek clicks kill the in-flight `tweenTo` before starting another.
- **Emphasis vs timeline**: step-chip hover dims via `fillOpacity` / `strokeOpacity`, never `opacity`. Timeline tweens that animate opacity (ghosts, curtains, veils, notes) can no longer be overwritten or left at 0.22 after un-emphasize.
- **Reduced motion**: hook seeks `progress(1)` so the static frame is the finished, still-legible summary. `PatternCanvas` hides replay/pause when reduced motion is on.
- **Easing**: timeline defaults to `power2.inOut`. Traveling badges/tickets use the same family explicitly.
- **SVG ids**: `useSvgId()` in `components/illustrations/_shared.ts` namespaces def ids. `Arrow` and Prototype’s clone marker use it. No leftover hardcoded `id="…"`.
- **Theme tokens**: fills/strokes/text use `var(--accent|text|bg|surface|border|…)` from `globals.css`. Accent-filled shapes tween overlapping labels to `var(--bg)` so dark mode stays readable.
- **Scale pivots**: SVG scale uses `svgOrigin` (user space), not `transformOrigin: '400px 230px'` (bbox-relative — caused snaps).
- **Responsive board**: `SceneBoard` is `viewBox` + `width/height 100%` + `preserveAspectRatio="xMidYMid meet"`. Pixel layout lives in user space and scales uniformly.
- **i18n hook**: `ReplayButton` and `PatternCanvas` accept optional `labels?: { replay?: string; pause?: string }` (`PatternCanvas` also `play`). English defaults: Replay / Pause / Play.

## Per pattern

### singleton

**Found:** pulse used two overlapping opacity tweens; scale used bbox-relative origin; instance label stayed `--text` after the circle filled accent (poor dark contrast).
**Fixed:** single `fromTo` pulse, `svgOrigin: '400 230'`, label tweens to `--bg`. Step order ask → construct → share unchanged.

### factory-method

**Found:** factory scale pivot off-center; output connectors drawn before products existed; slot label contrast on accent fill.
**Fixed:** `svgOrigin` on the shop, `link-in` / `link-out` reveal with their steps, slot label → `--bg`. Order: caller → factory method → subclass product.

### abstract-factory

**Found:** “no mixed kit” note started visible and then _dimmed_ (backwards).
**Fixed:** starts at `opacity={0}` and fades in with matching parts. Order: contract → kits → parts.

### builder

**Found:** commit node scaled from a wrong origin (`620px 250px`).
**Fixed:** `svgOrigin: '640 228'`. Order: required base → optional steps → `.build()`.

### prototype

**Found:** hardcoded `id="proto-arr"` (collision if two scenes mounted); scale origin in px.
**Fixed:** `useSvgId('proto-arr')`, `svgOrigin: '220 240'`. Order: keep prototype → clone → new instances.

### adapter

**Found:** sleeve scale pivot wrong; “won’t fit” visible before the third-party side existed.
**Fixed:** `svgOrigin: '400 228'`; clash fades in at “what we have” and out when the sleeve translates. Order: need → have → adapt.

### bridge

**Found:** bridge stroke stopped at x=400, short of the implementation column (x=500).
**Fixed:** path `H500` and matching dash length. Order: implementations → abstraction pointer → delegate / swap.

### composite

**Found:** missing edge from `folder /lib` down to `file c`.
**Fixed:** added `M400 248 V300`. Order: shared contract → leaves → recurse/`sizeBytes()`.

### decorator

**Found:** px scale origins; Bold/Italic/output labels all dumped at the last step.
**Fixed:** `svgOrigin` on core and shells; Italic with first wrap, Bold + rendered markup with the stack. Order: plain → wrapper → compose layers.

### facade

**Found:** client→door line had no `data-step` (emphasis ignored it).
**Fixed:** tagged `data-step="2"`. Order: subsystem → one door → one client call.

### flyweight

**Found:** oak/pine/maple `<text>` had no `fill` (SVG default black — invisible on dark `--accent-soft`); tree scale used `transformOrigin: 'center'`.
**Fixed:** `fill="var(--text)"`; trees use `transformOrigin: '50% 50%'`. Order: shared types → cache → unique positions.

### proxy

**Found:** gate `scaleY` pivoted from the canvas center, not the gate.
**Fixed:** `svgOrigin: '458 228'`. Order: same interface → expensive ghost → build on demand.

### chain-of-responsibility

**Found:** ticket snapped (`duration: 0.01`) then walked _past_ Tech toward Manager while the copy said Tech handled it; no visual links; Tech label contrast on accent fill.
**Fixed:** desks link first; ticket fades in, Billing passes, ticket stops under Tech; Tech fill + labels → `--bg`; “Tech handled it”. Order: link → handle-or-pass → resolve.

### command

**Found:** ticket slid toward a button that did not exist yet; editor (the receiver that “carries the work”) appeared on the invoker step.
**Fixed:** tickets as objects → editor + ticket travels to the receiver → `Button.click` writes `“hello”`. Nested `data-step` on the ticket list removed so emphasis cannot dim the traveling command. Order matches scene-meta.

### interpreter

**Found:** `×` had no edges to 4 and 2; `transformOrigin: 'center'` on operators.
**Fixed:** tree is `+` over 3 and `×`, `×` over 4 and 2; each op scales from its own `svgOrigin`. `eval() → 11` still `3+(4*2)`. Order: leaves → operators → evaluate.

### iterator

**Found:** cell numerals had no `fill` (black / invisible in dark); only two of four cells highlighted; cursor skipped a consistent “visited” read.
**Fixed:** `fill="var(--text)"`; cursor walks 8→3→10→1, each cell accent + numeral `--bg`; then the veil hides storage. Order: cursor API → advance → hide the tree.

### mediator

**Found:** hub circle used accent fill with default `--text` (weak on dark orange).
**Fixed:** `textFill="var(--bg)"`. Sideways dashed paths still fade when routing through the tower. Order: hub → participants → route.

### memento

**Found:** `TextEditor` NodeBox label sat on top of `hello` / `world`.
**Fixed:** chrome row + content rect so snapshots and restore do not collide. Order: snapshot → caretaker stack → restore.

### observer

**Found:** subject missing from step 0; pulse used competing opacity tweens + px origin; subscriber names stayed `--text` on accent fills.
**Fixed:** subject tagged `0,1`; one `fromTo` pulse with `svgOrigin`; names → `--bg` as they `update()`. Order: subscribe → publish → react.

### state

**Found:** `state →` badge sat on stage during “state objects” before the context existed.
**Fixed:** badge arrives with the context, then slides as Closed dims and Open + `send()` take over. Order: modes → context holds one → behavior swaps.

### strategy

**Found:** `BulkDiscount` overshot the dashed `Checkout.pricing` slot (bottom edge 22px low).
**Fixed:** settle at `y: -152, x: 190` inside the slot, then `$10 × 12 → $96`. Order: family → one slot → delegate.

### template-method

**Found:** none material — skeleton, blank bar, subclass fills already matched step order and tokens.
**Fixed:** no scene rewrite.

### visitor

**Found:** none material — inspector already walks Stock → Bond → Deposit; reports appear as the operation living outside.
**Fixed:** no scene rewrite.

## MiniPreview

**Found:** only eight patterns had a distinct glyph; the rest shared a generic two-box default. No def ids (so no collisions), but the atlas was not pattern-legible.
**Fixed:** unique 160×90 glyph per id, CSS variables / `currentColor` only, `width="100%"`, no `id` / markers / GSAP. Pulse uses existing `animate-pulse-soft`.

## Typecheck

`npx tsc --noEmit` (Node 18.20.8): **no errors in owned files** (`components/illustrations/**`, `PatternCanvas.tsx`, `ReplayButton.tsx`). Repo-wide tsc currently fails on the parallel i18n worker’s `LocalizedText` mismatches in `lib/**`, `app/**`, and other components — out of scope here.

## Needs a live browser

`npx tsc --noEmit` covers types, not paint. Confirm in the browser:

- Light **and** dark on a pattern page: accent-filled labels (singleton, factory slot, chain Tech, iterator cells, observer names, mediator hub).
- Replay + rapid Replay / step-chip clicks: no leftover transforms, pause stays in sync.
- `prefers-reduced-motion: reduce`: final still frame, no replay chrome.
- Landing atlas: 23 MiniPreviews, both themes, no clipped glyphs at card size.
- Step chips vs motion: hover emphasize must not freeze a mid-tween opacity (curtain, veil, ghosts).
