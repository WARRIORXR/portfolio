/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 900: '#0f172a', 800: '#1e1b4b', 700: '#312e81' },
        accent: {
          blue: '#3b82f6',
          violet: '#8b5cf6',
          cyan: '#06b6d4',
          pink: '#ec4899',
          emerald: '#10b981',
        },
        glass: {
          white: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.1)',
          hover: 'rgba(255,255,255,0.08)',
        },
      },
      backdropBlur: { xs: '2px' },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 8s ease-in-out 2s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'gradient-x': 'gradient-x 8s ease infinite',
        'gradient-y': 'gradient-y 8s ease infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        'gradient-y': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'top' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'bottom' },
        },
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
        glow: {
          '0%, 100%': { 'box-shadow': '0 0 20px rgba(59,130,246,0.3)' },
          '50%': { 'box-shadow': '0 0 40px rgba(139,92,246,0.5), 0 0 80px rgba(59,130,246,0.2)' },
        },
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'hero-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.1) 100%)',
        'text-gradient': 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31,38,135,0.37)',
        'glass-lg': '0 16px 48px 0 rgba(31,38,135,0.5)',
        glow: '0 0 20px rgba(59,130,246,0.4)',
        'glow-violet': '0 0 20px rgba(139,92,246,0.4)',
        'glow-cyan': '0 0 20px rgba(6,182,212,0.4)',
      },
    },
  },
  plugins: [],
}
