/**
 * NEXUS Color System
 * 
 * Semantic color tokens for light and dark themes.
 * Premium, minimal, calm aesthetic with excellent accessibility.
 */

export const colors = {
  light: {
    // Surfaces
    background: {
      primary: "hsl(0, 0%, 100%)",        // Pure white
      secondary: "hsl(210, 20%, 98%)",    // Subtle gray
      tertiary: "hsl(210, 20%, 96%)",     // Deeper gray
      elevated: "hsl(0, 0%, 100%)",       // White (cards, dialogs)
      overlay: "hsla(0, 0%, 0%, 0.4)",    // Modal backdrop
    },

    // Text
    text: {
      primary: "hsl(222, 20%, 12%)",      // Almost black
      secondary: "hsl(220, 10%, 45%)",    // Medium gray
      tertiary: "hsl(220, 10%, 60%)",     // Light gray
      disabled: "hsl(220, 10%, 75%)",     // Very light gray
      inverse: "hsl(0, 0%, 100%)",        // White on dark surfaces
    },

    // Borders
    border: {
      primary: "hsl(220, 13%, 91%)",      // Subtle border
      secondary: "hsl(220, 13%, 87%)",    // More visible border
      focus: "hsl(222, 70%, 55%)",        // Focus ring
      hover: "hsl(220, 13%, 85%)",        // Hover state
    },

    // Interactive
    interactive: {
      primary: "hsl(222, 70%, 55%)",      // Blue
      primaryHover: "hsl(222, 70%, 50%)",
      primaryActive: "hsl(222, 70%, 45%)",
      
      secondary: "hsl(220, 13%, 91%)",
      secondaryHover: "hsl(220, 13%, 87%)",
      secondaryActive: "hsl(220, 13%, 83%)",
    },

    // Status
    status: {
      success: "hsl(142, 70%, 45%)",
      successSubtle: "hsl(142, 70%, 97%)",
      
      warning: "hsl(38, 92%, 50%)",
      warningSubtle: "hsl(38, 92%, 97%)",
      
      error: "hsl(0, 72%, 51%)",
      errorSubtle: "hsl(0, 72%, 97%)",
      
      info: "hsl(210, 92%, 50%)",
      infoSubtle: "hsl(210, 92%, 97%)",
    },

    // Accent colors for tags, categories
    accent: {
      purple: "hsl(270, 70%, 60%)",
      purpleSubtle: "hsl(270, 70%, 97%)",
      
      pink: "hsl(330, 70%, 60%)",
      pinkSubtle: "hsl(330, 70%, 97%)",
      
      orange: "hsl(25, 85%, 55%)",
      orangeSubtle: "hsl(25, 85%, 97%)",
      
      teal: "hsl(175, 70%, 45%)",
      tealSubtle: "hsl(175, 70%, 97%)",
      
      indigo: "hsl(240, 70%, 60%)",
      indigoSubtle: "hsl(240, 70%, 97%)",
    },
  },

  dark: {
    // Surfaces
    background: {
      primary: "hsl(222, 20%, 8%)",       // Deep dark blue-black
      secondary: "hsl(222, 18%, 11%)",    // Slightly lighter
      tertiary: "hsl(222, 16%, 14%)",     // Card backgrounds
      elevated: "hsl(222, 16%, 16%)",     // Elevated cards, dialogs
      overlay: "hsla(0, 0%, 0%, 0.6)",    // Modal backdrop
    },

    // Text
    text: {
      primary: "hsl(210, 20%, 98%)",      // Almost white
      secondary: "hsl(220, 10%, 70%)",    // Medium gray
      tertiary: "hsl(220, 10%, 55%)",     // Darker gray
      disabled: "hsl(220, 10%, 40%)",     // Very dark gray
      inverse: "hsl(222, 20%, 12%)",      // Dark on light surfaces
    },

    // Borders
    border: {
      primary: "hsl(220, 13%, 20%)",      // Subtle border
      secondary: "hsl(220, 13%, 25%)",    // More visible border
      focus: "hsl(222, 70%, 60%)",        // Focus ring
      hover: "hsl(220, 13%, 27%)",        // Hover state
    },

    // Interactive
    interactive: {
      primary: "hsl(222, 70%, 60%)",      // Lighter blue for dark mode
      primaryHover: "hsl(222, 70%, 65%)",
      primaryActive: "hsl(222, 70%, 70%)",
      
      secondary: "hsl(220, 13%, 20%)",
      secondaryHover: "hsl(220, 13%, 25%)",
      secondaryActive: "hsl(220, 13%, 30%)",
    },

    // Status
    status: {
      success: "hsl(142, 60%, 50%)",
      successSubtle: "hsl(142, 60%, 12%)",
      
      warning: "hsl(38, 80%, 55%)",
      warningSubtle: "hsl(38, 80%, 12%)",
      
      error: "hsl(0, 65%, 55%)",
      errorSubtle: "hsl(0, 65%, 12%)",
      
      info: "hsl(210, 80%, 55%)",
      infoSubtle: "hsl(210, 80%, 12%)",
    },

    // Accent colors for tags, categories
    accent: {
      purple: "hsl(270, 60%, 65%)",
      purpleSubtle: "hsl(270, 60%, 12%)",
      
      pink: "hsl(330, 60%, 65%)",
      pinkSubtle: "hsl(330, 60%, 12%)",
      
      orange: "hsl(25, 75%, 60%)",
      orangeSubtle: "hsl(25, 75%, 12%)",
      
      teal: "hsl(175, 60%, 50%)",
      tealSubtle: "hsl(175, 60%, 12%)",
      
      indigo: "hsl(240, 60%, 65%)",
      indigoSubtle: "hsl(240, 60%, 12%)",
    },
  },
} as const;

export type ColorTheme = keyof typeof colors;
export type Colors = typeof colors;
