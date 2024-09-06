/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
module.exports = {
	content: ["./**/*.templ", "./node_modules/flowbite/**/*.js"],

	darkMode: ['class'],
	theme: {
	  extend: {
		fontFamily: {
		  sans: ['Inter', 'sans-serif'],
		},
		colors: {
			'v-blue-deep': colors.blue[600],  // Adding only blue-400 to the custom schema		
			'v-blue-light-backgroud': color.blue[50],
			
			'v-beige-dark': '#A39564',
			'v-blue-light': '#8089E8',
			'v-blue-dark': '#3B428F',
			'v-brown': '#665825',
			'v-grey-dark': '#282A38',
				}
	  },
	},
	plugins: [
	  require('flowbite/plugin')
	],
  };