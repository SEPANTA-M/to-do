import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        bg: {
          primary: "hsl(var(--bg-primary))",
          secondary: "hsl(var(--bg-secondary))",
          tertiary: "hsl(var(--bg-tertiary))",
          elevated: "hsl(var(--bg-elevated))",
          overlay: "hsl(var(--bg-overlay) / 0.4)",
        },
        
        // Text
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          tertiary: "hsl(var(--text-tertiary))",
          disabled: "hsl(var(--text-disabled))",
          inverse: "hsl(var(--text-inverse))",
        },
        
        // Borders
        border: {
          primary: "hsl(var(--border-primary))",
          secondary: "hsl(var(--border-secondary))",
          focus: "hsl(var(--border-focus))",
          hover: "hsl(var(--border-hover))",
        },
        
        // Interactive
        interactive: {
          primary: "hsl(var(--interactive-primary))",
          "primary-hover": "hsl(var(--interactive-primary-hover))",
          "primary-active": "hsl(var(--interactive-primary-active))",
          secondary: "hsl(var(--interactive-secondary))",
          "secondary-hover": "hsl(var(--interactive-secondary-hover))",
          "secondary-active": "hsl(var(--interactive-secondary-active))",
        },
        
        // Status
        status: {
          success: "hsl(var(--status-success))",
          "success-subtle": "hsl(var(--status-success-subtle))",
          warning: "hsl(var(--status-warning))",
          "warning-subtle": "hsl(var(--status-warning-subtle))",
          error: "hsl(var(--status-error))",
          "error-subtle": "hsl(var(--status-error-subtle))",
          info: "hsl(var(--status-info))",
          "info-subtle": "hsl(var(--status-info-subtle))",
        },
        
        // Accent
        accent: {
          purple: "hsl(var(--accent-purple))",
          "purple-subtle": "hsl(var(--accent-purple-subtle))",
          pink: "hsl(var(--accent-pink))",
          "pink-subtle": "hsl(var(--accent-pink-subtle))",
          orange: "hsl(var(--accent-orange))",
          "orange-subtle": "hsl(var(--accent-orange-subtle))",
          teal: "hsl(var(--accent-teal))",
          "teal-subtle": "hsl(var(--accent-teal-subtle))",
          indigo: "hsl(var(--accent-indigo))",
          "indigo-subtle": "hsl(var(--accent-indigo-subtle))",
        },
      },
      
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-base)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      
      fontSize: {
        xs: ["0.6875rem", { lineHeight: "1.4" }],      // 11px
        sm: ["0.8125rem", { lineHeight: "1.5" }],      // 13px
        base: ["0.9375rem", { lineHeight: "1.5" }],    // 15px
        md: ["1.0625rem", { lineHeight: "1.5" }],      // 17px
        lg: ["1.25rem", { lineHeight: "1.4" }],        // 20px
        xl: ["1.5rem", { lineHeight: "1.3" }],         // 24px
        "2xl": ["2rem", { lineHeight: "1.2" }],        // 32px
        "3xl": ["2.5rem", { lineHeight: "1.1" }],      // 40px
      },
      
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
      },
      
      transitionDuration: {
        instant: "50ms",
        fast: "150ms",
        DEFAULT: "250ms",
        slow: "350ms",
        slower: "500ms",
      },
      
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-8px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(8px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
      },
      
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "fade-out": "fade-out 150ms ease-in",
        "slide-in-from-top": "slide-in-from-top 250ms ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 250ms ease-out",
        "slide-in-from-left": "slide-in-from-left 250ms ease-out",
        "slide-in-from-right": "slide-in-from-right 250ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
