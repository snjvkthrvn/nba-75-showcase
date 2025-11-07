import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./styles/**/*.{css}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: "#0B0C0E",
        accent: {
          100: "#1E2A3B",
          200: "#2C3E57",
          300: "#3A5273",
          400: "#4C6894",
          500: "#6483B5",
        },
        glass: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        sans: [
          "SF Pro Display",
          "SF Pro Text",
          "-apple-system",
          "BlinkMacSystemFont",
          "\"Segoe UI\"",
          "Inter",
          "sans-serif",
        ],
        mono: ["\"SFMono-Regular\"", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        glass: "0 18px 60px rgba(8, 12, 20, 0.35)",
      },
      borderRadius: {
        "2xl": "1.5rem",
        "3xl": "1.875rem",
      },
      backdropBlur: {
        xl: "24px",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.33, 1, 0.68, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
