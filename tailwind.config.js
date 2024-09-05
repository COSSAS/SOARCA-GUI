/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./**/*.templ", "./node_modules/flowbite/**/*.js"],

	darkMode: ['class'],
	theme: {
	  extend: {
		fontFamily: {
		  sans: ['Inter', 'sans-serif'],
		},
	  },
	},
	plugins: [
	  require('flowbite/plugin')
	],
  };