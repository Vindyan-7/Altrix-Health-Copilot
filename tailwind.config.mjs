/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        aura: {
          sidebar: '#381840',
          'sidebar-deep': '#200028',
          'sidebar-text': '#BCA5C2',
          'sidebar-active': '#F0E0C0',
          canvas: '#FFF8FA',
          surface: '#FFFFFF',
          'surface-blush': '#FFF5FA',
          'surface-cream': '#F0E0C0',
          'surface-cream-light': '#F8EEDC',
          text: '#28152D',
          'text-muted': '#827783',
          'text-subtle': '#A59AA5',
          action: '#300D05',
          'action-hover': '#451A10',
          'accent-purple': '#EEDCF3',
          'accent-purple-strong': '#4A2054',
          'accent-peach': '#F9D8C9',
          'accent-orange': '#E9865D',
          'accent-pink': '#FBE6F5',
          success: '#6F7860',
          border: '#F0E9EF',
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: [
          '"DM Sans"',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        'aura-card': '0 5px 18px rgba(47, 20, 45, 0.045)',
        'aura-float': '0 8px 24px rgba(47, 20, 45, 0.08)',
        'aura-shell': '0 10px 32px rgba(47, 20, 45, 0.06)',
      },
      borderRadius: {
        'aura-card': '17px',
        'aura-panel': '20px',
        'aura-shell': '28px',
      },
    },
  },
  plugins: [],
};
