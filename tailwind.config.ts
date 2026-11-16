import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // SAPA Ayah Official Branding Palette
        sapa: {
          primary: '#547F9F',
          deep: '#385A75',
          soft: '#E8F0F5',
          bg: '#F5F7F8',
          dark: '#252D35',
          white: '#FFFFFF',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#547F9F',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#E8F0F5',
          foreground: '#385A75',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: '#F5F7F8',
          foreground: '#64748B',
        },
        accent: {
          DEFAULT: '#E8F0F5',
          foreground: '#385A75',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#252D35',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#252D35',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};

export default config;

