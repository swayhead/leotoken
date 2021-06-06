module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      animation: {
        'spin-3s': 'spin 3s linear infinite',
       }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
