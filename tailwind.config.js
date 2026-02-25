export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundColor: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        error: 'var(--bg-error)',
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        affirmation: 'var(--text-affirmation)',
        error: 'var(--text-error)',
        'btn-primary': 'var(--btn-primary-text)',
      },
      colors: {
        card: {
          DEFAULT: 'var(--card-bg)',
          border: 'var(--card-border)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
          glow: 'var(--accent-glow)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'subtle-shift': 'subtleShift 18s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        subtleShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Ubuntu',
          'Cantarell',
          'Noto Sans',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
        serif: ['Georgia', 'Times New Roman', 'serif']
      }
    }
  },
  plugins: []
};

