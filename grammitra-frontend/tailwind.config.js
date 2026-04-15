/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./features/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F59E0B",        // orange
        background: "#FDF6EC",     // light bg
        dark: "#3B2F2F",           // text dark
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        card: "0 4px 20px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};