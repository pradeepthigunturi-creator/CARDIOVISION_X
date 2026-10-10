/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#090D16",
          card: "#111827",
          border: "#1F2937",
          primary: "#3B82F6",
          accent: "#06B6D4",
          highlight: "#6366F1",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#EF4444"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
