/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cherry: {
          50:  '#fff5f5',
          100: '#ffebee',
          200: '#ffcdd2',
          300: '#ef9a9a',
          400: '#ef5350',
          500: '#e53935',
          600: '#d32f2f',
          700: '#c62828',
          800: '#7b0000',
          900: '#4a0000',
        },
        gold: {
          50:  '#fff8e1',
          300: '#ffd54f',
          500: '#f0a500',
          700: '#e65100',
        }
      },
      fontFamily: {
        sans: ['Onest', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(198,40,40,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(198,40,40,0.1)',
        'modal': '0 20px 60px rgba(0,0,0,0.15)',
      }
    },
  },
  plugins: [],
}
