/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rto: {
          navy: '#0f172a',
          navyLight: '#1e293b',
          blue: '#2563eb',
          blueDark: '#1d4ed8',
          blueLight: '#dbeafe',
          accent: '#0284c7',
          success: '#16a34a',
          successLight: '#dcfce7',
          warning: '#d97706',
          warningLight: '#fef3c7',
          danger: '#dc2626',
          dangerLight: '#fee2e2',
          surface: '#f8fafc',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
