import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontFamily: {
      sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      heading: ["var(--font-heading)", "sans-serif"],
      serif: ["var(--font-serif)", "Georgia", "serif"],
      arabic: ["var(--font-arabic)", "sans-serif"],
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brilliant: {
          green: "#6967fb",
          dark: "#1E1E1E",
          surface: "#F5F5F5",
          border: "#E8E8E8",
          text: "#1A1A1A",
          muted: "#999999",
          success: "#E8F8E8",
          blue: "#5B8DEE",
          yellow: "#F5C842",
          purple: "#6967fb",
          orange: "#F5923A",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(24px) scale(0.9)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "xp-pop": {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { transform: "scale(1.15)" },
          "70%": { transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "star-burst": {
          "0%": { opacity: "1", transform: "translate(0,0) scale(1)" },
          "100%": { opacity: "0", transform: "var(--star-translate) scale(0)" },
        },
        "star-twinkle": {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.6)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shiny-sweep": "shinySweep 6s ease-in-out infinite",
        "shiny-sweep-once": "shinySweepOnce 1s ease-out 1",
        "fade-in-up": "fade-in-up 0.6s ease-out both",
        "xp-pop": "xp-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
        "star-burst": "star-burst 0.7s ease-out both",
        "star-twinkle": "star-twinkle 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config

export default config