# Animate.css Class Reference & Utilities

Source Repository: [animate-css/animate.css](https://github.com/animate-css/animate.css.git)

## Core Class Structure
Animate.css uses a base class `animate__animated` followed by the effect name:
```html
<div class="animate__animated animate__fadeIn">...</div>
```

## Categories of Effects

### 1. Attention Seekers (Ideal for pattern steps and active states)
- `animate__bounce`: Bouncing animation.
- `animate__flash`: Quick double opacity flash.
- `animate__pulse`: Scale pulse, gentle heartbeat.
- `animate__rubberBand`: Elastic horizontal stretch.
- `animate__shakeX` / `animate__shakeY`: Error or invalid state vibration.
- `animate__headShake`: Subtle lateral shake.
- `animate__swing`: Pendulum swinging motion.
- `animate__tada`: Playful celebratory shake and scale.
- `animate__wobble`: Structural tilting motion.
- `animate__jello`: 2D skew jelly effect.
- `animate__heartBeat`: Heartbeat double-pulse.

### 2. Entrances (Ideal for modal dialogs, cards, tooltips)
- **Fades**: `animate__fadeIn`, `animate__fadeInDown`, `animate__fadeInLeft`, `animate__fadeInRight`, `animate__fadeInUp`
- **Zooms**: `animate__zoomIn`, `animate__zoomInDown`, `animate__zoomInUp`
- **Slides**: `animate__slideInDown`, `animate__slideInLeft`, `animate__slideInRight`, `animate__slideInUp`
- **Flips**: `animate__flipInX`, `animate__flipInY`
- **Back Entrances**: `animate__backInDown`, `animate__backInUp`

### 3. Exits
- **Fades**: `animate__fadeOut`, `animate__fadeOutDown`, `animate__fadeOutUp`
- **Zooms**: `animate__zoomOut`
- **Slides**: `animate__slideOutDown`, `animate__slideOutUp`

## Utility Modifiers
- **Delays**: `animate__delay-1s`, `animate__delay-2s`, `animate__delay-3s`
- **Speed**:
  - `animate__slow` (2s)
  - `animate__slower` (3s)
  - `animate__fast` (800ms)
  - `animate__faster` (500ms)
- **Repeat**: `animate__repeat-1`, `animate__repeat-2`, `animate__infinite`

## CSS Variables Customization
```css
:root {
  --animate-duration: 0.6s;
  --animate-delay: 0.2s;
  --animate-repeat: 1;
}
```
