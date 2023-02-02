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
  plugins: [require('@tailwindcss/typography')],
};
