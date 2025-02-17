import { type Config } from "tailwindcss";

export default {
	content: ["./src/**/*.tsx"],
	theme: {
		container: {
			center: true,
		},
		transitionDuration: {
			DEFAULT: "300ms",

			emphasized: "500ms",
			"emphasized-decelerate": "400ms",
			"emphasized-accelerate": "200ms",

			standard: "300ms",
			"standard-decelerate": "250ms",
			"standard-accelerate": "200ms",
		},
		transitionTimingFunction: {
			DEFAULT: "cubic-bezier(0.2, 0.0, 0, 1.0)",

			"emphasized-decelerate": "cubic-bezier(0.05, 0.7, 0.1, 1.0)",
			"emphasized-accelerate": "cubic-bezier(0.3, 0.0, 0.8, 0.15)",

			standard: "cubic-bezier(0.2, 0.0, 0, 1.0)",
			"standard-decelerate": "cubic-bezier(0, 0, 0, 1)",
			"standard-accelerate": "cubic-bezier(0.3, 0, 1, 1)",
		},
		colors: {
			transparent: "transparent",
			current: "currentColor",
			background: "hsl(var(--background) / <alpha-value>)",
			foreground: "hsl(var(--foreground) / <alpha-value>)",
			primary: {
				DEFAULT: "hsl(var(--primary) / <alpha-value>)",
				foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
			},
			secondary: {
				DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
				foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
			},
			muted: {
				DEFAULT: "hsl(var(--muted) / <alpha-value>)",
				foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
			},
			accent: {
				DEFAULT: "hsl(var(--accent) / <alpha-value>)",
				foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
			},
			destructive: {
				DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
				foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
			},
			border: "hsl(var(--border) / <alpha-value>)",
			input: "hsl(var(--input) / <alpha-value>)",
		},
		fontFamily: {
			sans: ["var(--font-inter)"],
		},
		extend: {
			transitionProperty: {
				colors_opacity:
					"color, background-color, border-color, text-decoration-color, fill, stroke, opacity",
			},
		},
	},
	plugins: [],
} satisfies Config;
