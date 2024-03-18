import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    keyframes: {
      wiggle: {
        'from': { transform: 'scale(1.02)' },
        'to': { transform: 'scale(1)' }
      },
      spin : {
        'from': { transform: 'rotate(0deg)' },
        'to' : { transform: 'rotate(360deg)' }
      },
    },
    extend: {
      animation: { 
        wiggle: 'wiggle 300ms ease-in-out',
        spin: 'spin 1s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      transitionProperty: {
        height: 'height',
        width: 'width'
      }
    }, 
  },
  plugins: [],
}
export default config
