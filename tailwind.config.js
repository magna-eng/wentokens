const { typewindTransforms } = require('typewind/transform');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    files: ['./index.html', './src/**/*.{ts,tsx}'],
    transform: typewindTransforms,
  },
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      neutral: {
        0: "#FFFFFF",
        400: "#898896",
        700: "#27262C",
        800: "#131316",
        900: "#050505",
      },
      primary: "#F5A5FE",
      critical: "#F5A5FE",
    },
    fontFamily: {
      display: ['Inter Display', 'Inter', 'sans-serif'],
      body: ['Inter', 'sans-serif'],
      logo: ['"Neue Montreal"', 'Arimo', 'sans-serif'],
    },
    extend: {
      backgroundImage: {
        congrats: "url('/congrats-modal-bg.svg')"
      }
    },
  },
  daisyui: {
    // themes: ["dark"]
    themes: [
      {
        wentokens: {
          primary: "#F5A5FE",
          secondary: "#050505",
          accent: "#F5A5FE",
          neutral: "#666472",
          "neutral-900": "#050505",
          "base-100": "#ffffff",
        },
      },
    ],
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
};
