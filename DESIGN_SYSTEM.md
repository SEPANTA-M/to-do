# NEXUS Spatial UI Design System

## Philosophy

NEXUS Spatial UI is designed around the principle: **"Turn chaos into visible flow."**

The design language prioritizes:
- **Clarity** - Information hierarchy is immediately visible
- **Calm** - Not overwhelming, promotes focus
- **Speed** - Fast interactions, minimal friction
- **Space** - Generous whitespace, clear boundaries
- **Premium** - Attention to detail, high quality

## Visual Language

### Characteristics

**What NEXUS IS:**
- Premium and refined
- Minimal but not sparse
- Spatial and layered
- Fast and responsive
- Technical yet human
- Calm and focused

**What NEXUS is NOT:**
- Generic SaaS dashboard
- Todo app clone
- Notion/Trello lookalike
- Cyberpunk neon
- Excessive glassmorphism
- Cluttered or overwhelming

## Color System

### Semantic Organization

Colors are organized by **purpose**, not by palette. This ensures:
1. Consistent meaning across the application
2. Easy theme switching
3. Accessibility compliance
4. Scalable color system

### Color Categories

#### 1. Surfaces
Background colors for different contexts:

```
bg-primary      - Main background (white/dark)
bg-secondary    - Subtle backgrounds (sidebar, hover states)
bg-tertiary     - Deeper backgrounds (cards, panels)
bg-elevated     - Floating elements (dialogs, popovers)
bg-overlay      - Modal backdrops
```

#### 2. Text
Text colors for hierarchy:

```
text-primary    - Main content (high contrast)
text-secondary  - Supporting text (medium contrast)
text-tertiary   - Deemphasized text (low contrast)
text-disabled   - Disabled states
text-inverse    - Text on dark surfaces
```

#### 3. Borders
Separation and focus:

```
border-primary      - Default borders
border-secondary    - Emphasized borders
border-focus        - Keyboard focus rings
border-hover        - Hover state borders
```

#### 4. Interactive
Actionable elements:

```
interactive-primary         - Primary actions (buttons, links)
interactive-primary-hover   - Hover state
interactive-primary-active  - Active/pressed state

interactive-secondary       - Secondary actions
interactive-secondary-hover
interactive-secondary-active
```

#### 5. Status
Feedback colors:

```
status-success       - Completed, successful actions
status-success-subtle - Subtle success backgrounds

status-warning       - Warnings, caution
status-warning-subtle

status-error         - Errors, destructive actions
status-error-subtle

status-info          - Informational messages
status-info-subtle
```

#### 6. Accent
Tags, categories, visual variety:

```
accent-purple / accent-purple-subtle
accent-pink / accent-pink-subtle
accent-orange / accent-orange-subtle
accent-teal / accent-teal-subtle
accent-indigo / accent-indigo-subtle
```

### Theme Modes

#### Light Mode
- **Background:** Pure white (#FFFFFF)
- **Contrast:** High, professional
- **Mood:** Clean, energetic, daytime

#### Dark Mode
- **Background:** Deep blue-black (hsl 222, 20%, 8%)
- **Contrast:** Carefully calibrated (not pure black)
- **Mood:** Calm, focused, low eye strain

**Important:** Dark mode is NOT an inverted light mode. It's independently designed.

## Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", 
             Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

System fonts ensure:
- Zero network requests
- Native OS appearance
- Excellent performance
- Consistent rendering

### Type Scale

Based on 15px body text (0.9375rem):

| Token | Size    | Use Case              |
|-------|---------|------------------------|
| xs    | 11px    | Metadata, timestamps   |
| sm    | 13px    | Secondary text, labels |
| base  | 15px    | Body text              |
| md    | 17px    | Emphasized body        |
| lg    | 20px    | Subheadings            |
| xl    | 24px    | Section headings       |
| 2xl   | 32px    | Page headings          |
| 3xl   | 40px    | Hero text              |

### Font Weights

```
normal: 400     - Body text
medium: 500     - Emphasized text
semibold: 600   - Headings, labels
bold: 700       - Strong emphasis (rare)
```

### Line Heights

```
tight: 1.2      - Large headings
snug: 1.4       - Subheadings
normal: 1.5     - Body text (default)
relaxed: 1.6    - Long-form content
```

### Best Practices

1. **Body text:** 15px (base), weight 400, line-height 1.5
2. **Headings:** Use weight 600-700, tight line-height
3. **Labels:** 13px (sm), weight 500
4. **Metadata:** 11px (xs), weight 400, text-tertiary color
5. **Never use font size for emphasis alone** - use weight and color

## Spacing

### Base Unit: 4px

All spacing uses a 4px base unit for visual rhythm:

```
1  = 4px
2  = 8px
3  = 12px
4  = 16px
5  = 20px
6  = 24px
8  = 32px
10 = 40px
12 = 48px
16 = 64px
20 = 80px
24 = 96px
```

### Application

**Padding:**
- Small elements: 8-12px (2-3)
- Medium elements: 16-24px (4-6)
- Large containers: 24-48px (6-12)

**Gaps:**
- Tight: 8px (2)
- Default: 16px (4)
- Relaxed: 24px (6)
- Loose: 32px (8)

**Margins:**
- Between elements: 16px (4)
- Between sections: 32px (8)
- Between major areas: 48px (12)

## Border Radius

Subtle, modern radii:

```
sm   = 4px      - Small elements (badges, pills)
base = 8px      - Default (buttons, inputs)
md   = 12px     - Medium cards
lg   = 16px     - Large cards, panels
xl   = 20px     - Hero sections
2xl  = 24px     - Large containers
full = 9999px   - Circular elements
```

**Default:** Most interactive elements use 8px (base)

## Elevation & Shadows

Subtle shadows create depth without heavy visual weight:

```
sm   - Slight lift (dropdowns)
base - Default elevation (cards)
md   - Moderate elevation (modals)
lg   - High elevation (popovers)
xl   - Maximum elevation (toasts)
```

### Shadow Composition

Shadows use **two layers** for realism:
1. Larger, softer shadow (ambient)
2. Smaller, sharper shadow (direct)

All shadows have very low opacity (4-8%) for subtlety.

## Motion & Animation

### Duration

```
instant: 50ms   - Immediate feedback
fast: 150ms     - Quick transitions
base: 250ms     - Default (most animations)
slow: 350ms     - Deliberate transitions
slower: 500ms   - Dramatic effects
```

### Easing

```
default: cubic-bezier(0.4, 0, 0.2, 1)  - Smooth in-out
in: cubic-bezier(0.4, 0, 1, 1)         - Accelerate
out: cubic-bezier(0, 0, 0.2, 1)        - Decelerate
```

### Principles

1. **Fast by default** - 150-250ms for most interactions
2. **Purposeful** - Motion should communicate state
3. **Subtle** - Don't distract from content
4. **Respect preferences** - Honor prefers-reduced-motion

### Common Animations

**Fade In:**
- Modals, overlays, tooltips
- Duration: 150ms
- Opacity: 0 → 1

**Slide In:**
- Command palette, drawers, dropdowns
- Duration: 250ms
- Transform + opacity

**Hover States:**
- Duration: 150ms (fast)
- Background color transitions
- No transform (avoid repaints)

## Components

### Button

**Variants:**
- `primary` - Main actions (blue background)
- `secondary` - Alternative actions (gray background)
- `ghost` - Minimal, hover only
- `danger` - Destructive actions (red)
- `link` - Text-only, underline on hover

**Sizes:**
- `sm` - 32px height, 12px padding
- `default` - 40px height, 16px padding
- `lg` - 48px height, 24px padding
- `icon` - 40px square

**States:**
- Default
- Hover (background change)
- Active (pressed)
- Focus (visible ring)
- Disabled (50% opacity)

### Empty State

**Structure:**
- Icon (large, low opacity)
- Title (semibold, text-primary)
- Description (text-secondary)
- Optional action button

**Use Cases:**
- No data yet
- Empty list
- Missing content
- First-time experience

## Layout Patterns

### Container Widths

```
sm:  640px  - Mobile landscape
md:  768px  - Tablets
lg:  1024px - Laptops
xl:  1280px - Desktops
2xl: 1536px - Large screens

max-w-2xl (672px)  - Forms, settings
max-w-4xl (896px)  - Content pages
max-w-5xl (1024px) - Main workspace
max-w-7xl (1280px) - Wide layouts
```

### Grid Systems

**Desktop Workspace:**
```
┌─────────┬──────────────────┬─────────┐
│ Sidebar │  Main Content    │ Panel   │
│ 256px   │  Flexible        │ 320px   │
└─────────┴──────────────────┴─────────┘
```

**Mobile:**
```
┌──────────────────────────────┐
│         Header               │
├──────────────────────────────┤
│                              │
│      Main Content            │
│      (Full Width)            │
│                              │
├──────────────────────────────┤
│      Bottom Navigation       │
└──────────────────────────────┘
```

## Accessibility

### Contrast Ratios

All text meets WCAG 2.1 Level AA:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Interactive elements: 3:1 minimum

### Focus Indicators

All interactive elements have **visible focus rings**:
- 2px solid border
- Primary blue color
- 2px offset from element
- Never removed with `outline: none` unless replacement provided

### Touch Targets

Minimum touch target size: **44px × 44px**

Applies to:
- Buttons
- Links
- Form controls
- Interactive icons

### Screen Readers

- Semantic HTML structure
- ARIA labels where needed
- Skip navigation links
- Meaningful alt text
- Proper heading hierarchy

## Responsive Behavior

### Mobile First

Always design mobile first, enhance for larger screens:

```tsx
// Mobile default
<div className="p-4">
  
// Desktop override
<div className="p-4 lg:p-8">
```

### Breakpoint Strategy

- **sm (640px):** Adjust typography
- **md (768px):** Two-column where appropriate
- **lg (1024px):** Show sidebar, hide bottom nav
- **xl (1280px):** Expand workspace
- **2xl (1536px):** Multi-panel layouts

## Usage Guidelines

### Do's

✅ Use semantic color tokens (bg-primary, text-secondary)  
✅ Maintain consistent spacing (4px increments)  
✅ Respect the type scale  
✅ Use subtle shadows  
✅ Ensure keyboard accessibility  
✅ Test both light and dark themes  
✅ Honor reduced motion preferences  

### Don'ts

❌ Use arbitrary colors (use tokens)  
❌ Use random spacing values  
❌ Create new font sizes  
❌ Over-shadow elements  
❌ Forget focus states  
❌ Design for one theme only  
❌ Assume mouse-only interaction  

## Design Tokens Reference

All design tokens are defined in:
- `src/design-system/tokens.ts` - Spacing, typography, etc.
- `src/design-system/colors.ts` - Color system
- `src/app/globals.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind integration

## Component Development Checklist

When building new components:

- [ ] Uses semantic color tokens
- [ ] Responsive (mobile-first)
- [ ] Keyboard navigable
- [ ] Visible focus indicators
- [ ] Light & dark theme support
- [ ] Proper ARIA labels
- [ ] Touch-friendly (44px targets)
- [ ] Respects reduced motion
- [ ] TypeScript types defined
- [ ] Documented with JSDoc

---

**Design System Version:** 1.0.0 (PHASE 0)  
**Last Updated:** Foundation Complete  
**Status:** Stable - Ready for feature development
