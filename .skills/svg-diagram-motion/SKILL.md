---
name: svg-diagram-motion
description: >-
  Use this skill when designing architectural diagram animations, software pattern flows,
  UML sequence animations, or interactive SVG schematic connections.
---

# SVG Diagram Motion Skill

This skill governs the standards and conventions for drawing and animating software engineering diagrams, architectures, and design patterns within the `design-pattern-with-motion` project.

## Diagram Semantic Conventions

1. **Category Accents**:
   - Creational: `--pattern-creational` (`#e85d04` light / `#f48c46` dark)
   - Structural: `--pattern-structural` (`#2a9d8f` light / `#5cb8aa` dark)
   - Behavioral: `--pattern-behavioral` (`#c77b43` light / `#d99463` dark)
2. **Nodes**:
   - Boxed components use `<NodeBox x={...} y={...} w={...} h={...} label="InterfaceName" sub="role" />`.
   - Corner radius: `rx="8" ry="8"`.
   - Hairline borders: `stroke="var(--border)" strokeWidth="1.25"`.
3. **Connectors**:
   - Inheritance / Implements: dashed line (`strokeDasharray="4 3"`), closed empty triangular arrowhead.
   - Dependency / Invocation: solid line with open arrowhead (`strokeWidth="1.25"`).
   - Data Packets / Messages: small traveling circles (`r="5" fill="var(--accent)"`) traveling along the path.

## References & Examples

- Complete Conventions: [diagram-conventions.md](./references/diagram-conventions.md)
- Architectural Flow Component: [ArchitecturalFlow.tsx](./examples/ArchitecturalFlow.tsx)
