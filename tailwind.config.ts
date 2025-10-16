import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // This enables the 'dark:' variant
  theme: {
    extend: {
      colors: {
        // --- LIGHT MODE COLORS (DEFAULT) ---
        primary: "hsl(224, 76%, 55%)",
        "primary-hover": "hsl(224, 76%, 48%)",
        accent: "hsl(174, 62%, 45%)",
        background: "hsl(220, 20%, 97%)",
        surface: "hsl(0, 0%, 100%)",
        "surface-secondary": "hsl(210, 22%, 95%)",
        border: "hsl(210, 16%, 82%)",
        "text-primary": "hsl(222, 47%, 11%)",
        "text-secondary": "hsl(215, 16%, 47%)",
        "text-muted": "hsl(215, 16%, 65%)",
        success: "hsl(142, 71%, 45%)",
        warning: "hsl(38, 92%, 50%)",
        error: "hsl(0, 84%, 60%)",
        ring: "hsl(224, 76%, 55%)",

        // --- DARK MODE COLORS ---
        // These are used with the 'dark:' prefix, e.g., dark:bg-primary
        dark: {
          primary: "hsl(224, 85%, 75%)",
          "primary-hover": "hsl(224, 85%, 82%)",
          accent: "hsl(174, 60%, 60%)",
          background: "hsl(222, 47%, 11%)",
          surface: "hsl(222, 47%, 15%)",
          "surface-secondary": "hsl(222, 47%, 20%)",
          border: "hsl(215, 27%, 27%)",
          "text-primary": "hsl(210, 40%, 98%)",
          "text-secondary": "hsl(215, 20%, 70%)",
          "text-muted": "hsl(215, 20%, 50%)",
          success: "hsl(142, 72%, 55%)",
          warning: "hsl(38, 92%, 55%)",
          error: "hsl(0, 74%, 65%)",
          ring: "hsl(224, 85%, 75%)",
        },
      },
      keyframes: {
        "modal-in": {
          "0%": { opacity: "0", transform: "translateY(-10px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "modal-in": "modal-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
