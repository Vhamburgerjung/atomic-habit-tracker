/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        card: '#13131A',
        border: '#1E1E2E',
        foreground: '#F1F0ED',
        muted: '#9CA3AF',
        accent: '#7C3AED',
        'accent-light': '#9F67FF',
        success: '#10B981',
        warning: '#F59E0B',
      },
    },
  },
  plugins: [],
};
