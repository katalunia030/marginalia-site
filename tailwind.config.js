/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Instrument Serif"', 'Georgia', 'serif'],
        body: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      colors: {
        mg: {
          bg: '#F5F2ED',
          card: '#FAF8F5',
          warm: '#EDE8E0',
          text: '#2A2622',
          t2: '#4A4640',
          t3: '#6B6560',
          muted: '#8B8580',
          faded: '#ABA5A0',
          line: '#E8E4DB',
          border: '#D4CEC5',
        }
      }
    },
  },
  plugins: [],
}
