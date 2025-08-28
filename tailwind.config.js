/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",   // <- scan all src files
  ],
  theme: { extend: {} },
  plugins: [],
}
