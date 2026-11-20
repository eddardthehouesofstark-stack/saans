/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0d0f14',
        ink: '#f2efe9',
        mute: '#8b8f99',
        amber: '#e8a33d',
        green: '#2dd4a7',
        alarm: '#f87171',
        panel: '#11141b',
      },
      fontFamily: {
        display: ['"Archivo Black"', 'Impact', 'system-ui', 'sans-serif'],
        grotesk: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        nudge: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(18px,-14px,0)' },
        },
      },
      animation: {
        nudge: 'nudge 1.8s ease-in-out infinite',
        drift: 'drift 24s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
