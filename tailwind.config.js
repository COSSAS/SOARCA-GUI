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
			'c-dark-slate-background': colors.slate[950],
			'c-dark-slate-header-background': colors.slate[800],
			'c-dark-slate-navbar-background': colors.slate[800],
 			'c-dark-slate-card': colors.slate[800],	
			'c-dark-slate-border': colors.slate[600],
			'c-dark-slate-text': colors.slate[200],
			'c-dark-slate-text-dark': colors.slate[600],
			'c-dark-slate-documentation-background': colors.slate[900],
			'c-dark-background': colors.slate[600],
			'c-dark-blue-background': colors.blue[950],
		}
	  },
	},
	plugins: [
	  require('flowbite/plugin')
	],
  };