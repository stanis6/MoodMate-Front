// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        text:        "#2c3e50",
        sub:         "#7f8c8d",
        header:      "#34495e",
        bg:          "#ffffff",
        border:      "#e0e0e0",
        softTeal:    "#E0F7FA",
        pastelBlue:  "#B2EBF2",
        pastelMint:  "#C8E6C9",
        pastelYellow:"#FFF9C4",
        accentBlue:  "#0288D1",
        accentGreen: "#388E3C",
        accentOrange:"#F57C00",
        accentPurple:"#7E57C2",
      },
      fontFamily: {
        sans: ['-apple-system','BlinkMacSystemFont','"Segoe UI"','Roboto','sans-serif']
      },
      spacing: {
        gutter: '1rem'
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full-lg': '50%',
      },
      boxShadow: {
        // existing
        'card':        '0 2px 6px rgba(0,0,0,0.05)',
        'card-hover':  '0 4px 12px rgba(0,0,0,0.08)',
        // added playful glows
        'glow-blue':   '0 0 10px rgba(2, 136, 209, 0.5), 0 0 20px rgba(2, 136, 209, 0.3)',
        'glow-green':  '0 0 10px rgba(56, 142, 60, 0.5), 0 0 20px rgba(56, 142, 60, 0.3)',
        'glow-orange': '0 0 10px rgba(245, 124, 0, 0.5), 0 0 20px rgba(245, 124, 0, 0.3)',
      },
      keyframes: {
        // existing modals
        overlayIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        modalIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // playful animations
        bouncePlayful: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%':      { transform: 'rotate(2deg)' },
        },
        confetti: {
          '0%':   { opacity: '0' },
          '50%':  { opacity: '1', transform: 'translateY(-20px) rotate(10deg)' },
          '100%': { opacity: '0', transform: 'translateY(0) rotate(-10deg)' },
        },
      },
      animation: {
        // existing
        'overlay-in': 'overlayIn 200ms ease-out forwards',
        'modal-in':   'modalIn   200ms ease-out forwards',
        // playful
        'bounce-playful': 'bouncePlayful 800ms ease-in-out infinite',
        'wiggle-fast':    'wiggle 300ms ease-in-out infinite',
        'confetti-fall':  'confetti 1200ms ease-out',
      }
    }
  },
  plugins: []
};
