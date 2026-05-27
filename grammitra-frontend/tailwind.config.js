/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./features/**/*.{js,ts,jsx,tsx}",
    "./shared/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Expose CSS variables as named tokens so future code can use clean
      // utilities (bg-card, text-text-soft, border-border) instead of the
      // verbose arbitrary `bg-[var(--card)]`. The existing arbitrary-value
      // classes keep working — these are additive.
      colors: {
        bg: "var(--bg)",
        "bg-soft": "var(--bg-soft)",
        card: "var(--card)",
        input: "var(--input)",

        text: {
          DEFAULT: "var(--text)",
          soft: "var(--text-soft)",
          muted: "var(--text-muted)",
        },

        border: "var(--border)",
        ring: "var(--ring)",

        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          soft: "var(--primary-soft)",
          fg: "var(--on-primary)",
        },
        accent: "var(--accent)",

        success: {
          DEFAULT: "var(--success)",
          soft: "var(--success-soft)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          soft: "var(--warning-soft)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          soft: "var(--danger-soft)",
        },
        info: {
          DEFAULT: "var(--info)",
          soft: "var(--info-soft)",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        medium: "var(--shadow-medium)",
      },
    },
  },
  plugins: [],
};
