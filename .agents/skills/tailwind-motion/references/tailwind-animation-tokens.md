# Tailwind Animation Tokens Reference

Source Repositories:
- [jamiebuilds/tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate.git)
- [romboHQ/tailwind-motion](https://github.com/romboHQ/tailwind-motion.git)

## Recommended Utilities Pattern

```css
@keyframes pulse-subtle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.02); }
}

@keyframes dash-flow {
  to {
    stroke-dashoffset: -20;
  }
}

@keyframes grid-glow {
  0%, 100% { opacity: 0.05; }
  50% { opacity: 0.12; }
}
```

## Utility Classes Reference
- `.animate-pulse-subtle`: Gentle breathing animation for diagram focus.
- `.animate-flow-dash`: Animated dashed connector lines in architectural flows.
- `.transition-all duration-300 ease-out`: Standard transition for cards and interactive pills.
- `hover:border-[var(--accent)]`: Border color highlight using CSS variables.
