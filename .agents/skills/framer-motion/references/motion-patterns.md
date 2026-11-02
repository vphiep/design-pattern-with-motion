# Framer Motion Patterns Reference

Source Repository: [motiondivision/motion](https://github.com/motiondivision/motion.git)

## 1. Route Transition (`RouteTransition.tsx`)
In Next.js App Router, wrap layout children:
```tsx
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

## 2. Shared Layout Indicator (`layoutId`)
Smoothly animates an indicator between siblings without managing coordinate math:
```tsx
{tabs.map((tab) => (
  <button key={tab.id} onClick={() => setActive(tab.id)} className="relative px-4 py-2">
    {tab.label}
    {active === tab.id && (
      <motion.div
        layoutId="activeTabPill"
        className="absolute inset-0 bg-[var(--accent)] rounded-md -z-10"
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
    )}
  </button>
))}
```

## 3. Micro-Interaction Spring Values
- **Snappy Button Press**:
  ```tsx
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
  />
  ```
- **Fluid Floating Card**:
  ```tsx
  <motion.div
    whileHover={{ y: -4, boxShadow: '0 12px 24px -10px rgba(0,0,0,0.15)' }}
    transition={{ duration: 0.2 }}
  />
  ```
