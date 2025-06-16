/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('daisyui'),
    require('tailwind-scrollbar'),
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['light'],
          primary: '#0ea5e9',
          secondary: '#0369a1',
          accent: '#37CDBE',
          neutral: '#3D4451',
          'base-100': '#FFFFFF',
          'base-200': '#F2F2F2',
          'base-300': '#E5E6E6',
        },
        dark: {
          ...require('daisyui/src/theming/themes')['dark'],
          primary: '#0ea5e9',
          secondary: '#0369a1',
          accent: '#37CDBE',
          neutral: '#191D24',
          'base-100': '#2A303C',
          'base-200': '#242933',
          'base-300': '#20252E',
        },
      },
    ],
    darkTheme: 'dark',
  },
} 