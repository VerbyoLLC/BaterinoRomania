/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'arrow-bounce-down': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
        'sheet-slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'overlay-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'modal-zoom-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'arrow-bounce-down': 'arrow-bounce-down 1.5s ease-in-out infinite',
        'sheet-slide-up': 'sheet-slide-up 260ms cubic-bezier(0.32, 0.72, 0, 1) both',
        'overlay-fade-in': 'overlay-fade-in 180ms ease-out both',
        'modal-zoom-in': 'modal-zoom-in 180ms ease-out both',
      },
    },
  },
  plugins: [],
}
