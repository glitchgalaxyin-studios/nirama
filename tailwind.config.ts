import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FCFBF8",
        charcoal: "#1A1A1A",
        gold: "#B3945E",
        sage: "#A8C3A2",
        sand: "#D7BA84",
        terracotta: "#C88B78",
      },
      boxShadow: {
        glass: "0 8px 30px rgba(0, 0, 0, 0.04)",
        glow: "0 24px 80px rgba(179, 148, 94, 0.18)",
      },
      borderRadius: {
        squircle: "2rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      backgroundImage: {
        "gold-radial":
          "radial-gradient(circle at top, rgba(179, 148, 94, 0.18), transparent 56%)",
      },
    },
  },
  plugins: [],
};

export default config;
