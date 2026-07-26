// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				// ============================================================
				// رنگ‌های پویا (از CSS Variables)
				// ============================================================
				primary: {
					DEFAULT: "var(--primary, #8b0000)",
					container: "var(--primary-container, #8b0000)",
					fixed: "var(--primary-fixed, #ffdad4)",
					"fixed-dim": "var(--primary-fixed-dim, #ffb4a8)",
					foreground: "hsl(var(--primary-foreground))",
				},
				"on-primary": "var(--on-primary, #ffffff)",
				"primary-container": "var(--primary-container, #8b0000)",
				"on-primary-container": "var(--on-primary-container, #ff907f)",
				"primary-fixed": "var(--primary-fixed, #ffdad4)",
				"primary-fixed-dim": "var(--primary-fixed-dim, #ffb4a8)",

				secondary: {
					DEFAULT: "var(--secondary, #904d00)",
					container: "var(--secondary-container, #fd8b00)",
					foreground: "hsl(var(--secondary-foreground))",
				},
				"on-secondary": "var(--on-secondary, #ffffff)",
				"on-secondary-container": "var(--on-secondary-container, #603100)",

				surface: "var(--surface, #f9f9fc)",
				"surface-bright": "var(--surface-bright, #f9f9fc)",
				"surface-dim": "var(--surface-dim, #dadadc)",
				"surface-container": "var(--surface-container, #eeeef0)",
				"surface-container-low": "var(--surface-container-low, #f3f3f6)",
				"surface-container-lowest": "var(--surface-container-lowest, #ffffff)",
				"surface-container-high": "var(--surface-container-high, #e8e8ea)",
				"surface-container-highest": "var(--surface-container-highest, #e2e2e5)",

				outline: "var(--outline, #8e706b)",
				"outline-variant": "var(--outline-variant, #e3beb8)",

				background: "var(--background, #f9f9fc)",
				"on-background": "var(--on-background, #1a1c1e)",
				"on-surface": "var(--on-surface, #1a1c1e)",
				"on-surface-variant": "var(--on-surface-variant, #5a403c)",

				error: {
					DEFAULT: "var(--error, #ba1a1a)",
					foreground: "hsl(var(--error-foreground))",
				},
				"error-container": "var(--error-container, #ffdad6)",
				"on-error": "var(--on-error, #ffffff)",
				"on-error-container": "var(--on-error-container, #93000a)",

				tertiary: {
					DEFAULT: "var(--tertiary, #003420)",
					foreground: "hsl(var(--tertiary-foreground))",
				},
				"tertiary-container": "var(--tertiary-container, #004d31)",
				"on-tertiary": "var(--on-tertiary, #ffffff)",
				"on-tertiary-container": "var(--on-tertiary-container, #58c390)",

				// ============================================================
				// ShadCN (بدون تغییر)
				// ============================================================
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			fontFamily: {
				sans: ["PersianNumbers", "var(--font-vazirmatn)", "Vazirmatn", "iransans", "sans-serif"],
				"body-md": ["PersianNumbers", "var(--font-vazirmatn)", "Vazirmatn", "sans-serif"],
				"body-lg": ["PersianNumbers", "var(--font-vazirmatn)", "Vazirmatn", "sans-serif"],
				"headline-sm": ["PersianNumbers", "var(--font-vazirmatn)", "Vazirmatn", "sans-serif"],
				"headline-md": ["PersianNumbers", "var(--font-vazirmatn)", "Vazirmatn", "sans-serif"],
				"headline-lg": ["PersianNumbers", "var(--font-vazirmatn)", "Vazirmatn", "sans-serif"],
				"label-md": ["PersianNumbers", "var(--font-vazirmatn)", "Vazirmatn", "sans-serif"],
				"number-data": ["PersianNumbers", "var(--font-vazirmatn)", "monospace"],
				"number-display": ["PersianNumbers", "var(--font-vazirmatn)", "monospace"],
				mono: ["JetBrains Mono", "monospace"],
				geist: ["GeistSans", "GeistMono", "sans-serif"],
			},
			fontSize: {
				"body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
				"body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
				"headline-sm": ["20px", { lineHeight: "30px", fontWeight: "700" }],
				"headline-md": ["24px", { lineHeight: "36px", fontWeight: "700" }],
				"headline-lg": ["32px", { lineHeight: "48px", fontWeight: "800" }],
				"label-md": ["14px", { lineHeight: "20px", fontWeight: "500" }],
				"number-data": ["14px", { lineHeight: "18px", fontWeight: "600" }],
				"number-display": ["22px", { lineHeight: "24px", fontWeight: "700" }],
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
			screens: {
				"750-900": { min: "750px", max: "900px" },
				"750-1210": { min: "750px", max: "1210px" },
			},
		},
	},
	corePlugins: {
		rtl: true,
	},
	plugins: [require("tailwindcss-animate")],
};

export default config;