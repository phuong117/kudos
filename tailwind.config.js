/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#30cfd0",
        "primary-glow": "#330867",
        secondary: "#330867",
        accent: "#f59e0b",
        surface: "#111116",
        background: "#050507",
      },
    },
  },
  plugins: [],
};
