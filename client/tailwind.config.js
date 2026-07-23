/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        secondary: {
          50: "#fdf4ff",
          100: "#fae8ff",
          500: "#a855f7",
          600: "#9333ea",
        },
        accent: {
          500: "#f59e0b",
          600: "#d97706",
        },
        success: "#10b981",
        danger: "#ef4444",
        warning: "#f59e0b",
        info: "#3b82f6",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "card-hover": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      },
      animation: {
        "bounce-once": "bounceOnce 0.6s ease-out",
        "fade-in":     "fadeIn 0.25s ease-out",
        "slide-up":    "slideUp 0.3s ease-out",
        "float":       "float 3s ease-in-out infinite",
        "slide-up-fade":"slideUpFade 0.5s ease-out",
        "glow-pulse":  "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        bounceOnce: {
          "0%":   { transform: "scale(0.3)", opacity: "0" },
          "50%":  { transform: "scale(1.15)", opacity: "1" },
          "75%":  { transform: "scale(0.92)" },
          "100%": { transform: "scale(1)" },
        },
        fadeIn: {
          "0%":   { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px) rotate(-1deg)" },
          "50%":     { transform: "translateY(-6px) rotate(1deg)" },
        },
        slideUpFade: {
          "0%":   { opacity: "0", transform: "translateY(20px) scale(0.9)" },
          "60%":  { opacity: "1", transform: "translateY(-4px) scale(1.02)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        glowPulse: {
          "0%,100%": { boxShadow: "0 0 8px 2px #818cf888" },
          "50%":     { boxShadow: "0 0 20px 6px #818cf8cc" },
        },
      },
    },
  },
  plugins: [],
};