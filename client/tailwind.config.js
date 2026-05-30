/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-error": "#ffffff",
        "primary-fixed-dim": "#4cd7f6",
        "on-tertiary-fixed": "#002113",
        "on-surface": "#191c1e",
        "surface-container-high": "#e6e8ea",
        "on-tertiary-fixed-variant": "#005236",
        "surface-container-highest": "#e0e3e5",
        "surface-bright": "#f7f9fb",
        "surface-variant": "#e0e3e5",
        "on-secondary": "#ffffff",
        "on-tertiary-container": "#00452e",
        "inverse-primary": "#4cd7f6",
        "outline": "#6d797d",
        "surface": "#f7f9fb",
        "background": "#f7f9fb",
        "surface-container": "#eceef0",
        "on-primary-fixed": "#001f26",
        "on-primary-fixed-variant": "#004e5c",
        "on-primary": "#ffffff",
        "tertiary": "#006c49",
        "secondary-fixed": "#e9ddff",
        "error": "#ba1a1a",
        "tertiary-fixed": "#6ffbbe",
        "outline-variant": "#bcc9cd",
        "on-primary-container": "#00424f",
        "on-secondary-container": "#fffbff",
        "on-surface-variant": "#3d494c",
        "primary-fixed": "#acedff",
        "surface-container-low": "#f2f4f6",
        "secondary-fixed-dim": "#d0bcff",
        "on-secondary-fixed-variant": "#5516be",
        "on-error-container": "#93000a",
        "on-secondary-fixed": "#23005c",
        "surface-tint": "#00687a",
        "secondary": "#6b38d4",
        "inverse-surface": "#2d3133",
        "surface-container-lowest": "#ffffff",
        "on-tertiary": "#ffffff",
        "primary-container": "#06b6d4",
        "on-background": "#191c1e",
        "primary": "#00687a",
        "tertiary-container": "#1bbd85",
        "error-container": "#ffdad6",
        "surface-dim": "#d8dadc",
        "secondary-container": "#8455ef",
        "inverse-on-surface": "#eff1f3",
        "tertiary-fixed-dim": "#4edea3"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "unit": "8px",
        "container-max": "1280px",
        "margin-mobile": "16px",
        "margin-desktop": "40px",
        "gutter": "24px"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "sans-serif"]
      }
    },
  },
  plugins: [],
}
