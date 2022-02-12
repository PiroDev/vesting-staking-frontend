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
      'extra-small': '320px',
      'small': '768px',
      'medium': '1024px',
      'big': '1440px',
      'massive': '1920px'
    },
  },
  plugins: [],
}