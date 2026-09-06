/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        xray: {
          dark: '#07090E',
          surface: '#0B0F17',
          card: '#101622',
          cardHover: '#151D2C',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(6, 182, 212, 0.3)',
          cyan: '#06B6D4',
          cyanGlow: 'rgba(6, 182, 212, 0.25)',
          emerald: '#10B981',
          emeraldGlow: 'rgba(16, 185, 129, 0.25)',
          violet: '#6366F1',
          violetGlow: 'rgba(99, 102, 241, 0.25)',
          amber: '#F59E0B',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'scan': 'scan 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'radar': 'radar 8s linear infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)', opacity: '0.15' },
          '50%': { transform: 'translateY(100%)', opacity: '0.6' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
        'radial-glow': "radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.15), transparent 70%)",
        'conic-radar': "conic-gradient(from 0deg at 50% 50%, rgba(6, 182, 212, 0) 0deg, rgba(6, 182, 212, 0.25) 300deg, rgba(6, 182, 212, 0.8) 360deg)",
      }
    },
  },
  plugins: [],
}
