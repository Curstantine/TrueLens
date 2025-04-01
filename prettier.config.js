/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
// eslint-disable-next-line import/no-anonymous-default-export
export default {
	plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-prisma"],
	useTabs: true,
	tabWidth: 4,
	printWidth: 100,
	tailwindStylesheet: "./src/styles/globals.css",
};
