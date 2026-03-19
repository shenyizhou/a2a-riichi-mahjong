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
          board: '#15803d',
          tile: '#fef3c7',
        },
      },
    },
  },
  plugins: [],
}
export default config
