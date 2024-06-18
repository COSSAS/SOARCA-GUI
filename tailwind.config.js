/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./**/*.templ"],
	// Disable Tailwind colors:
	// theme: { colors: {} },

	darkMode: ['selector', '[data-mode="dark"]'],
		// ...
	  
	plugins: [],
};


