import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F14",
        paper: "#F6F7F9",
        brand: {
          DEFAULT: "#FF3B30",
          soft: "#FFE9E7",
        },
        go: "#0EA65C",
        wait: "#F5A524",
        avoid: "#E5484D",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,15,20,0.06), 0 4px 20px rgba(11,15,20,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
