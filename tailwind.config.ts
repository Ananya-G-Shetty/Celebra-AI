import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FFFDF9',
          100: '#FAF7F2',
          200: '#F5EFEB',
          300: '#EBE3DC',
          400: '#D5C9BE',
          500: '#BDB0A3',
        },
        plum: {
          50: '#F9F0F7',
          100: '#F1DCED',
          200: '#E4BADB',
          300: '#D190C3',
          400: '#B862A5',
          500: '#943C82',
          600: '#7B2A6A',
          700: '#641E55',
          800: '#4A154B', // Core deep plum
          900: '#320B33',
          950: '#200521',
        },
        burgundy: {
          50: '#FDF2F4',
          100: '#FBE4E8',
          200: '#F7CBD2',
          300: '#F0A5B1',
          400: '#E47386',
          500: '#D34861',
          600: '#B62C47',
          700: '#8E1D34',
          800: '#722F37', // Core burgundy
          900: '#4D1421',
        },
        coral: {
          50: '#FFF5F4',
          100: '#FFE9E7',
          200: '#FFD4D0',
          300: '#FFB2AB',
          400: '#FF887D',
          500: '#FF6F61', // Soft coral
          600: '#F04C3C',
          700: '#C93627',
        },
        gold: {
          50: '#FCF9EE',
          100: '#F7F0D5',
          200: '#EDE0A8',
          300: '#E1CB76',
          400: '#D4AF37', // Warm gold
          500: '#B89224',
          600: '#937016',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(74, 21, 75, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        card: '0 4px 20px -2px rgba(74, 21, 75, 0.07), 0 2px 6px -1px rgba(74, 21, 75, 0.04)',
        elevated: '0 12px 32px -4px rgba(74, 21, 75, 0.12), 0 4px 12px -2px rgba(74, 21, 75, 0.06)',
        plumGlow: '0 0 25px rgba(114, 47, 55, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
