module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js}",
  ],
  theme: {
    extend: {
      colors: {
        'main-color-light': '#fdf5e0',
        'main-color': '#ffd42c',
        'main-color-darker': '#e2ad06',
        'selection-color': '#eff3f8'
      },
    },
    screens: {
      'mobile-sm': '320px',
      'tablet': '768px',
      'laptop': '1024px',
      'laptop-lg': '1440px',
      'laptop-xl': '1920px'
    },
  },
  plugins: [],
}