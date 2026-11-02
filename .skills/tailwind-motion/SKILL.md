---
name: tailwind-motion
description: >-
  Use this skill when configuring or applying Tailwind CSS animation utilities,
  keyframes, custom timing functions, and transition tokens within the project design system.
---

# Tailwind CSS Motion & Animation Skill

Tailwind CSS motion utilities (`https://github.com/jamiebuilds/tailwindcss-animate.git` & `https://github.com/romboHQ/tailwind-motion.git`) provide declarative, composable CSS animation classes that leverage hardware acceleration with zero client-side JavaScript.

## When to Use Tailwind Motion in this Project

- **Blueprint Grid & Hairline Animations**: Subtly glowing lines or grid intersection blinks in `components/BlueprintGrid.tsx`.
- **Skeleton Loaders & Shimmer States**: Java code syntax loading or diagram preloading.
- **Micro-State Hover & Focus Rings**: Border transitions on buttons and pattern cards.
- **Theme Transitions**: Coordinating dark/light mode surface color transitions (`duration-300`).

## Design System Tokens in this Codebase

Defined in `app/globals.css` and `tailwind.config.ts`:
- Colors: `var(--accent)`, `var(--secondary)`, `var(--border-soft)`, `var(--pattern-creational)`
- Durations: `duration-150` (micro), `duration-300` (state), `duration-500` (structural)
- Easings: `ease-out`, `cubic-bezier(0.2, 0.7, 0.2, 1)`

## References & Examples

- Animation Tokens & Keyframes: [tailwind-animation-tokens.md](./references/tailwind-animation-tokens.md)
- Blueprint Pulse Component: [BlueprintPulse.tsx](./examples/BlueprintPulse.tsx)
