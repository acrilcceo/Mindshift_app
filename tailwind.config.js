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
        success: 'var(--bg-success)',
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        affirmation: 'var(--text-affirmation)',
        error: 'var(--text-error)',
        success: 'var(--text-success)',
        'btn-primary': 'var(--btn-primary-text)',
      },
      borderColor: {
        error: 'var(--text-error)',
      },
      colors: {
        surface: { 
          base: "#F7F8FA", 
          elevated: "#FFFFFF", 
          muted: "#EEF1F5" 
        }, 
        darkSurface: { 
          base: "#0F1115", 
          elevated: "#151922", 
          muted: "#1C2230" 
        }, 
        textPrimary: { 
          light: "#1E293B", 
          dark: "#F1F5F9" 
        }, 
        textSecondary: { 
          light: "#475569", 
          dark: "#CBD5E1" 
        },
        card: {
          DEFAULT: 'var(--card-bg)',
          border: 'var(--card-border)',
          glass: 'var(--card-glass)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
          glow: 'var(--accent-glow)',
          subtle: 'var(--bg-accent-subtle)',
          'border-subtle': 'var(--border-accent-subtle)',
        },
      },
      backgroundImage: {
        'btn-primary': 'var(--btn-primary-bg)',
      },
      boxShadow: {
        'btn': 'var(--btn-shadow)',
        'btn-hover': 'var(--btn-shadow-hover)',
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

