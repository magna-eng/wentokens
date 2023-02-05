const { typewindTransforms } = require('typewind/transform');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    files: ['./index.html', './src/**/*.{ts,tsx}'],
    transform: typewindTransforms,
  },
  theme: {
    extend: {},
  },
  daisyui: {
    // themes: ["dark"]
    themes: [{
      dark: {
        ...require("daisyui/src/colors/themes")["[data-theme=dark]"],
        primary: "#D926AA",
      },
    }],
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
};
