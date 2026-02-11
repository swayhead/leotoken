/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      animation: {
        "spin-3s": "spin 3s linear infinite",
      },
    },
  },
  plugins: [],
};
