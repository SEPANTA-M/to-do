/**
 * NEXUS Spatial UI Design Tokens
 * 
 * Semantic design tokens for the NEXUS productivity platform.
 * These tokens create a premium, minimal, spatial aesthetic.
 */

export const tokens = {
  /**
   * Typography Scale
   * Harmonious type scale for hierarchy
   */
  typography: {
    fontSize: {
      xs: "0.6875rem",    // 11px - Metadata
      sm: "0.8125rem",    // 13px - Secondary text
      base: "0.9375rem",  // 15px - Body text
      md: "1.0625rem",    // 17px - Emphasized body
      lg: "1.25rem",      // 20px - Subheadings
      xl: "1.5rem",       // 24px - Headings
      "2xl": "2rem",      // 32px - Large headings
      "3xl": "2.5rem",    // 40px - Hero text
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      tight: "1.2",
      snug: "1.4",
      normal: "1.5",
      relaxed: "1.6",
    },
    letterSpacing: {
      tight: "-0.01em",
      normal: "0",
      wide: "0.01em",
      wider: "0.02em",
    },
  },

  /**
   * Spacing Scale
   * Consistent spatial rhythm (4px base)
   */
  spacing: {
    0: "0",
    1: "0.25rem",   // 4px
    2: "0.5rem",    // 8px
    3: "0.75rem",   // 12px
    4: "1rem",      // 16px
    5: "1.25rem",   // 20px
    6: "1.5rem",    // 24px
    8: "2rem",      // 32px
    10: "2.5rem",   // 40px
    12: "3rem",     // 48px
    16: "4rem",     // 64px
    20: "5rem",     // 80px
    24: "6rem",     // 96px
  },

  /**
   * Border Radius
   * Subtle, modern radii
   */
  radius: {
    none: "0",
    sm: "0.25rem",    // 4px
    base: "0.5rem",   // 8px
    md: "0.75rem",    // 12px
    lg: "1rem",       // 16px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
    full: "9999px",
  },

  /**
   * Elevation
   * Subtle shadows for depth
   */
  elevation: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
  },

  /**
   * Border Widths
   */
  borderWidth: {
    0: "0",
    1: "1px",
    2: "2px",
    4: "4px",
  },

  /**
   * Motion
   * Calm, purposeful animations
   */
  motion: {
    duration: {
      instant: "50ms",
      fast: "150ms",
      base: "250ms",
      slow: "350ms",
      slower: "500ms",
    },
    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },

  /**
   * Z-Index Scale
   */
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    popover: 1400,
    toast: 1500,
    tooltip: 1600,
  },
} as const;

export type Tokens = typeof tokens;
