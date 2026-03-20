import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mahjong: {
          green: '#166534',
          red: '#dc2626',
          board: '#1a5f2a',
          boardDark: '#0f3d1a',
          tile: '#fef3c7',
          tileBorder: '#d97706',
        },
      },
      backgroundImage: {
        'mahjong-table': "repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 2px, transparent 2px, transparent 8px)",
      }
    },
  },
  plugins: [],
}
export default config
