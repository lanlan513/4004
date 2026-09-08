/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 丛林深绿主色
        jungle: {
          950: '#04090a',
          900: '#07110d',
          800: '#0c1c15',
          700: '#122a1e',
          600: '#1a3c2b',
          500: '#25553e',
          400: '#3a7a59',
        },
        // 琥珀金强调色（树脂封蚊的琥珀意象）
        amber: {
          DEFAULT: '#e0a526',
          light: '#f5c95c',
          dark: '#b37f12',
        },
        bone: '#e9e3d0',
      },
      fontFamily: {
        display: ['Cinzel', 'Noto Serif SC', 'serif'],
        serif: ['"Noto Serif SC"', 'Cinzel', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        // 雾气缓慢漂移
        fogDrift: {
          '0%': { transform: 'translateX(-5%) translateY(0)' },
          '50%': { transform: 'translateX(5%) translateY(-2%)' },
          '100%': { transform: 'translateX(-5%) translateY(0)' },
        },
        // 背景缓慢推近（Ken Burns）
        kenBurns: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.12) translate(-1.5%, -1.5%)' },
        },
        // 文案上浮入场
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // 琥珀呼吸光晕
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 24px rgba(224,165,38,0.35), 0 0 64px rgba(224,165,38,0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(224,165,38,0.55), 0 0 96px rgba(224,165,38,0.25)' },
        },
        // 底部滚动提示
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.9' },
          '50%': { transform: 'translateY(8px)', opacity: '0.4' },
        },
      },
      animation: {
        fog: 'fogDrift 18s ease-in-out infinite',
        'fog-slow': 'fogDrift 26s ease-in-out infinite reverse',
        'ken-burns': 'kenBurns 20s ease-out forwards',
        'fade-up': 'fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'bounce-slow': 'bounceSlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
