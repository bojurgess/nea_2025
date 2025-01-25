import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";

export default {
	content: ["./src/**/*.{html,js,svelte,ts}"],

	theme: {
		extend: {
			fontFamily: {
				display: ["Mona Sans Variable", "sans-serif"],
				body: ["Inter Variable", "sans-serif"],
			},
		},
	},

	plugins: [typography, forms],
} satisfies Config;
