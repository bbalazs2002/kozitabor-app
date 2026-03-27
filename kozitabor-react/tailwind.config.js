/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@tremor/react/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['CinzelVariable', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /^(bg|text|border|fill)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/,
      variants: ['hover', 'ui-selected'],
    },
  ]
};