import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import tailwindcssForms from "@tailwindcss/forms";
import tailwindcssAnimate from "tailwindcss-animate";

/** Maps a CSS variable holding "r g b" channels to a Tailwind color with alpha support. */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-sans)", ...fontFamily.sans],
				display: ["var(--font-display)", ...fontFamily.sans],
			},
			colors: {
				background: token("background"),
				foreground: token("foreground"),
				card: {
					DEFAULT: token("card"),
					foreground: token("card-foreground"),
				},
				popover: {
					DEFAULT: token("popover"),
					foreground: token("popover-foreground"),
				},
				primary: {
					DEFAULT: token("primary"),
					hover: token("primary-hover"),
					foreground: token("primary-foreground"),
				},
				secondary: {
					DEFAULT: token("secondary"),
					foreground: token("secondary-foreground"),
				},
				muted: {
					DEFAULT: token("muted"),
					foreground: token("muted-foreground"),
				},
				subtle: {
					foreground: token("subtle-foreground"),
				},
				accent: {
					DEFAULT: token("accent"),
					foreground: token("accent-foreground"),
				},
				destructive: {
					DEFAULT: token("destructive"),
					foreground: token("destructive-foreground"),
				},
				success: token("success"),
				warning: token("warning"),
				border: token("border"),
				input: token("input"),
				ring: token("ring"),
			},
			borderRadius: {
				media: "10px",
				panel: "16px",
				// shadcn internals: never produce a 4px or 6px corner on visible containers.
				lg: "16px",
				md: "12px",
				sm: "10px",
			},
			zIndex: {
				nav: "40",
				banner: "45",
				overlay: "50",
				popover: "55",
				toast: "60",
			},
			keyframes: {
				skeleton: {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0.55" },
				},
			},
			animation: {
				skeleton: "skeleton 1.6s ease-in-out infinite",
			},
			transitionTimingFunction: {
				out: "cubic-bezier(0.2, 0.8, 0.2, 1)",
			},
			// Panels and modals (spec 2.6). tailwindcss-animate derives its
			// animation durations from this scale, so duration-220 sets both.
			transitionDuration: {
				220: "220ms",
			},
		},
	},
	plugins: [tailwindcssAnimate, tailwindcssForms],
} satisfies Config;
