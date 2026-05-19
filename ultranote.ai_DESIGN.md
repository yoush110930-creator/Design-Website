---
name: Ultranote.ai
colors:
  surface: '#14121b'
  surface-dim: '#14121b'
  surface-bright: '#3a3842'
  surface-container-lowest: '#0e0d16'
  surface-container-low: '#1c1a24'
  surface-container: '#201e28'
  surface-container-high: '#2b2932'
  surface-container-highest: '#35333e'
  on-surface: '#e5e0ee'
  on-surface-variant: '#c9c4d8'
  inverse-surface: '#e5e0ee'
  inverse-on-surface: '#312f39'
  outline: '#928ea1'
  outline-variant: '#484555'
  surface-tint: '#c9bfff'
  primary: '#c9bfff'
  on-primary: '#2e009c'
  primary-container: '#917eff'
  on-primary-container: '#28008a'
  inverse-primary: '#5d3fe0'
  secondary: '#c9bfff'
  on-secondary: '#2f148c'
  secondary-container: '#4632a2'
  on-secondary-container: '#b7aaff'
  tertiary: '#ffb77d'
  on-tertiary: '#4d2600'
  tertiary-container: '#d57a1e'
  on-tertiary-container: '#432100'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e5deff'
  primary-fixed-dim: '#c9bfff'
  on-primary-fixed: '#1a0063'
  on-primary-fixed-variant: '#441cc8'
  secondary-fixed: '#e5deff'
  secondary-fixed-dim: '#c9bfff'
  on-secondary-fixed: '#1a0063'
  on-secondary-fixed-variant: '#4632a2'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#14121b'
  on-background: '#e5e0ee'
  surface-variant: '#35333e'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-tablet: 32px
  margin-mobile: 20px
---

## Brand & Style
This design system is built to facilitate deep academic focus and intellectual clarity. It blends a **Minimal Modern** aesthetic with **Glassmorphism**, drawing inspiration from the vastness of outer space to evoke a sense of calm and limitless potential. The brand personality is professional, intelligent, and unobtrusive, acting as a quiet companion to the user's research and writing process.

The visual language relies on high-quality typography and generous whitespace, reminiscent of high-end consumer hardware interfaces. By utilizing a dark-only theme, the system reduces eye strain during long study sessions, while soft nebula glows provide a sense of depth and atmospheric quality without distracting from the primary task: note-taking and knowledge synthesis.

## Colors
The palette is centered on a deep, obsidian-purple base that serves as the canvas for academic productivity. 

- **Primary Purple Accent (#7B61FF):** Used for primary actions, focus states, and branding elements. It represents intelligence and modern AI integration.
- **Secondary Purple Glow (#9D8CFF):** Reserved for interactive hover states and soft lighting effects that suggest "active" AI processes.
- **Light Text (#F3F2FF):** The high-contrast color for legibility, ensuring academic papers and notes are crisp and readable.
- **Muted Text (#A8A5C0):** Used for metadata, secondary labels, and less critical information to maintain visual hierarchy.

The background should feature subtle radial gradients of deep indigo and violet to simulate a "nebula" effect, localized in corners or behind active workspace modules.

## Typography
The typography within this design system prioritizes legibility and a systematic "Apple-like" airiness. **Inter** is utilized for its exceptional performance in digital interfaces, offering a neutral yet professional tone.

Headlines should be set with slightly tighter letter-spacing to appear more cohesive, while body text—intended for long-form reading—requires a generous line height (1.6) to prevent reader fatigue. Captions and labels utilize an increased letter-spacing and medium weight to remain legible at smaller scales against the dark background.

## Layout & Spacing
This design system employs a **Fixed Grid** approach for content-heavy views to maintain focus, transitioning to a fluid model for the workspace dashboard. 

A strict 8px rhythm governs all spacing. Large margins (64px on desktop) are used to isolate content blocks, mimicking the spacious feel of high-end productivity applications. 

- **Desktop:** 12-column grid with 24px gutters.
- **Tablet:** 8-column grid with 20px gutters.
- **Mobile:** 4-column grid with 16px gutters.

Horizontal alignment is critical; elements should align to the grid to create a structured, "intelligent" feel that reflects the organized nature of academic work.

## Elevation & Depth
Elevation is communicated through **Glassmorphism** and light rather than traditional drop shadows. 

- **Surfaces:** Use a backdrop blur of `20px` to `40px` combined with the semi-transparent `glass_bg`.
- **Borders:** Every glass container must have a `1px` solid border (`glass_border`) to define its edges against the nebula background.
- **Glows:** High-priority elements (like the active AI response) utilize a "Secondary Purple Glow" outer shadow with a large spread (30-50px) and low opacity (15%) to simulate an ambient light source emanating from the UI component itself.

## Shapes
The shape language is refined and approachable. A `roundedness` level of **2** (0.5rem / 8px) is the standard for primary UI components like buttons and input fields. 

Larger containers, such as note cards or modal overlays, should use `rounded-xl` (1.5rem / 24px) to create a soft, protective feel for the user's data. This balance between structured internal elements and softer outer containers reinforces the "calm and professional" vibe.

## Components

### Buttons
- **Primary:** Solid `#7B61FF` background with `#F3F2FF` text. High-contrast, no border.
- **Secondary (Glass):** `rgba(255, 255, 255, 0.06)` background with a `1px` border of `rgba(255, 255, 255, 0.1)`.
- **Tertiary:** Ghost style, text-only with a secondary color hover state.

### Input Fields
Inputs are minimalist, featuring only a subtle glass bottom border or a full glass container with `0.06` opacity. The focus state is signaled by the border transitioning to the Primary Purple and a very soft outer glow.

### Cards & Modules
All containers for notes or AI insights utilize the glassmorphism stack: 
- `backdrop-filter: blur(20px)`
- `background: rgba(255, 255, 255, 0.06)`
- `border: 1px solid rgba(255, 255, 255, 0.1)`

### Chips & Tags
Small, pill-shaped indicators for academic categories. Use a very low opacity primary purple background (`rgba(123, 97, 255, 0.1)`) with `13px` medium-weight text.

### AI Progress Indicator
A smooth, pulsing gradient line using both Primary and Secondary purples, placed at the top of a glass container to indicate the AI is processing or synthesizing information.