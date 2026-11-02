---
name: animate-css
description: >-
  Use this skill when implementing cross-browser CSS keyframe animations,
  attention seekers (pulse, flash, bounce), and quick entrance/exit effects
  using Animate.css conventions and Tailwind CSS utility integration.
---

# Animate.css Skill

Animate.css (`https://github.com/animate-css/animate.css.git`) is a library of ready-to-use, cross-browser animations for CSS. In modern Next.js and Tailwind projects, its patterns provide instant micro-interactions, badge alerts, and entrance cues without JavaScript overhead.

## When to Use Animate.css in this Project

- **Attention Seekers**: Emphasizing an active pattern node or trigger during a step (e.g. `animate-pulse`, `animate-bounce`, `animate-rubberBand`).
- **Notification & Badge Entrances**: Flash messages, code copy tooltips, progress updates.
- **Card Entry Staggers**: Subtly revealing pattern cards in the catalog.
- **CSS-First Animations**: Situations where pure GPU-accelerated CSS animations are preferred over JS runtime overhead.

## Tailwind CSS Integration

Rather than loading the entire monolithic `animate.css` CSS file, you can integrate key animations into Tailwind or import `@import "animate.css";` in `globals.css`.

In `globals.css`:
```css
/* Custom utility extensions matching Animate.css properties */
@layer utilities {
  .animate-duration-fast {
    animation-duration: 0.3s;
  }
  .animate-duration-normal {
    animation-duration: 0.6s;
  }
}
```

## Accessibility (Reduced Motion)
Always ensure animations are muted or disabled when `prefers-reduced-motion` is active:
```css
@media (prefers-reduced-motion: reduce) {
  .animate__animated {
    animation: none !important;
    transition: none !important;
  }
}
```

## References & Examples

- Complete Class Guide: [animation-classes.md](./references/animation-classes.md)
- Attention Badge Component: [AttentionBadge.tsx](./examples/AttentionBadge.tsx)
- Staggered Card Entry: [StaggeredCardList.tsx](./examples/StaggeredCardList.tsx)
