/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./**/*.templ","./node_modules/flowbite/**/*.js"],
	// Disable Tailwind colors:
	// theme: { colors: {} },

	darkMode: ['selector', '[data-mode="dark"]'],
		// ...
	  
	plugins: [
        require('flowbite/plugin')
    ],


};


