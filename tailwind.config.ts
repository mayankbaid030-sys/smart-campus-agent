import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0B0B12",
          card: "#131226",
          elevated: "#1b1933",
          border: "#262444",
        },
        brand: {
          violet: "#7C3AED",
          pink: "#EC4899",
          blue: "#3B82F6",
          cyan: "#06B6D4",
          amber: "#F59E0B",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
      },
      animation: {
        "orb-pulse": "orb-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "orb-glow": "orb-glow 2s ease-in-out infinite alternate",
        "radar-ping": "radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "gradient-shift": "gradient-shift 6s ease infinite",
      },
      keyframes: {
        "orb-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
        },
        "orb-glow": {
          "0%": { filter: "drop-shadow(0 0 15px rgba(124, 58, 237, 0.7)) drop-shadow(0 0 25px rgba(236, 72, 153, 0.5))" },
          "100%": { filter: "drop-shadow(0 0 25px rgba(236, 72, 153, 0.9)) drop-shadow(0 0 45px rgba(59, 130, 246, 0.7))" },
        },
        "radar-ping": {
          "0%": { transform: "scale(0.95)", opacity: "0.8" },
          "70%": { transform: "scale(1.2)", opacity: "0" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
