/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F2E7',
        paper2: '#EFE7D6',
        ink: '#26301F',
        moss: {
          50: '#EEF3E9',
          100: '#D9E5CC',
          300: '#9DBB88',
          500: '#5B8A57',
          600: '#3F6B4F',
          700: '#2F5140',
          900: '#1E3327',
        },
        honey: {
          200: '#F5DBA3',
          400: '#EAB25C',
          500: '#E0954F',
          600: '#C97A3A',
        },
        berry: {
          400: '#C4788A',
          500: '#B75D6B',
          600: '#954652',
        },
        sky: {
          400: '#7FA6B0',
          500: '#5C8A97',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Nunito Sans"', 'sans-serif'],
      },
      borderRadius: {
        blob: '42% 58% 63% 37% / 41% 44% 56% 59%',
      },
      boxShadow: {
        soft: '0 2px 0 rgba(38, 48, 31, 0.08)',
        lift: '0 10px 24px -12px rgba(38, 48, 31, 0.35)',
      },
    },
  },
  plugins: [],
}
