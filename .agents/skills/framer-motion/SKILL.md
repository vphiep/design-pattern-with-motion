---
name: framer-motion
description: >-
  Use this skill when implementing React component transitions, shared layout animations (layoutId),
  route transitions, drag/hover gestures, and spring physics using Framer Motion (Motion).
---

# Framer Motion (Motion) Skill

Motion (`https://github.com/motiondivision/motion.git`, formerly Framer Motion) is the declarative animation library used in this project for UI micro-interactions, tab switches, route transitions (`RouteTransition`), and fluid layout transformations.

## When to Use Framer Motion in this Project

- **Page & Route Transitions**: Smooth fade/slide transitions when switching between patterns and categories.
- **Shared Layout Animations (`layoutId`)**: Underline pills on tabs, category selector active states, expanding cards into detail views.
- **Gestures**: Interactive buttons, cards with physical hover lift and tap squash.
- **AnimatePresence**: Exit animations when unmounting components (toasts, modals, code drawer).

## Best Practices for This Project

1. Always use `'use client'` on components importing `motion` or `AnimatePresence`.
2. Group related animation variants into reusable objects outside component render loops to avoid object recreation.
3. Use spring physics (`type: 'spring', stiffness: 400, damping: 30`) for tactile UI elements, and easing curves (`ease: [0.2, 0.7, 0.2, 1]`) for route transitions.
4. Integrate with `components/MotionConfigProvider.tsx` for global reduced motion preferences.

## References & Examples

- Advanced Patterns: [motion-patterns.md](./references/motion-patterns.md)
- Shared Layout Active Tabs: [SharedLayoutTabs.tsx](./examples/SharedLayoutTabs.tsx)
- Modal & Drawer Overlay: [ModalOverlay.tsx](./examples/ModalOverlay.tsx)
