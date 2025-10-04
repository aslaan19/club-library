// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ألوان نادي وعيّن من اللوجو
        waaeen: {
          red: {
            DEFAULT: '#DC2626', // الأحمر الأساسي
            dark: '#B91C1C',    // أحمر داكن
            light: '#EF4444',   // أحمر فاتح
          },
          black: {
            DEFAULT: '#111827', // الأسود الأساسي
            light: '#1F2937',   // رمادي غامق
          }
        }
      },
      fontFamily: {
        arabic: ['Cairo', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};

export default config;