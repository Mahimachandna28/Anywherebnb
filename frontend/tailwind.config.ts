import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        airbnb: {
          rose: "#FF385C",
          roseHover: "#E00B41",
          dark: "#222222",
          gray: "#717171",
          lightGray: "#F7F7F7",
          border: "#EBEBEB",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        airbnb: "0 1px 2px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)",
        airbnbHover: "0 2px 4px rgba(0, 0, 0, 0.18)",
        airbnbModal: "0 8px 28px rgba(0, 0, 0, 0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
