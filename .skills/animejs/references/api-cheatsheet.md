# Anime.js API Cheatsheet & Guidelines

Source Repository: [juliangarnier/anime](https://github.com/juliangarnier/anime.git)

## Core Concepts

### 1. Targets
```javascript
anime({
  targets: '.css-selector',      // CSS Selector
  targets: domNode,              // Single DOM Node or React Ref
  targets: [el1, el2],           // Array of elements
  targets: jsObject,             // Plain JavaScript object { count: 0 }
  // ...
});
```

### 2. Animatable Properties
- **CSS Properties**: `opacity`, `backgroundColor`, `borderRadius`, `top`, `left`, etc.
- **CSS Transforms**: `translateX`, `translateY`, `rotate`, `scale`, `skew`.
- **SVG Attributes**: `d` (path morphing), `points`, `rx`, `ry`, `strokeDashoffset`.
- **DOM Attributes**: `value`, `placeholder`.
- **Object Properties**: Any numerical object property (`{ value: 0 } -> { value: 100 }`).

### 3. SVG Path Animation (`anime.setDashoffset` & `anime.path`)
```javascript
// Drawing SVG Stroke Lines:
anime({
  targets: '.svg-path',
  strokeDashoffset: [anime.setDashoffset, 0],
  easing: 'easeInOutSine',
  duration: 1200,
  delay: function(el, i) { return i * 250 },
  direction: 'alternate',
  loop: true
});

// Moving an element along an SVG curve:
const path = anime.path('#motion-path');
anime({
  targets: '.moving-ball',
  translateX: path('x'),
  translateY: path('y'),
  rotate: path('angle'),
  easing: 'linear',
  duration: 2000,
  loop: true
});
```

### 4. Morphing SVG Shapes (`d` attribute)
Requirements: Both SVG paths MUST have the same number of points/coordinates.
```javascript
anime({
  targets: '#morphing-path',
  d: [
    { value: 'M10,10 L90,10 L90,90 L10,90 Z' }, // Box
    { value: 'M50,10 L90,50 L50,90 L10,50 Z' }  // Diamond
  ],
  easing: 'easeOutElastic(1, .8)',
  duration: 1500,
  loop: true
});
```

### 5. Staggering
```javascript
anime({
  targets: '.grid-item',
  scale: [0.8, 1],
  opacity: [0, 1],
  delay: anime.stagger(100, { grid: [14, 5], from: 'center' })
});
```

### 6. Timelines
```javascript
const tl = anime.timeline({
  easing: 'easeOutExpo',
  duration: 750
});

tl.add({
  targets: '.packet',
  translateX: 250,
})
.add({
  targets: '.server-node',
  scale: 1.1,
  backgroundColor: '#e85d04'
}, '-=200')
.add({
  targets: '.response-packet',
  translateX: 0
});
```
