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
			'c-blue-deep-light': colors.blue[500],  
			'c-blue-deep': colors.blue[600],  
			'c-blue-deep-extra': colors.blue[700],		
			'c-blue-light-backgroud': colors.blue[50],
		}
	  },
	},
	plugins: [
	  require('flowbite/plugin')
	],
  };