/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "#000000",
          1: "#0A0A0A",
          2: "#111111",
          3: "#1A1A1A",
          4: "#222222",
        },
        accent: {
          DEFAULT: "#00D97E",
          dim: "#00B368",
          bright: "#00FF94",
        },
        muted: {
          DEFAULT: "#666666",
          light: "#888888",
        },
        danger: "#FF3B3B",
        warning: "#FFB800",
      },
      fontFamily: {
        display: ['"Syne"', "sans-serif"],
        body: ['"DM Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0, 217, 126, 0)" },
          "50%": { boxShadow: "0 0 20px 4px rgba(0, 217, 126, 0.15)" },
        },
      },
    },
  },
  plugins: [],
};
