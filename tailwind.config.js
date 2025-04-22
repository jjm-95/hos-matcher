/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Next.js App Router 경로
    "./pages/**/*.{js,ts,jsx,tsx}", // Next.js Pages Router 경로
    "./components/**/*.{js,ts,jsx,tsx}", // 컴포넌트 경로
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};