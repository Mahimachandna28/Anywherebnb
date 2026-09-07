import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anywherebnb: Vacation Rentals, Cabins, Beach Houses & More",
  description: "Recreated Airbnb fullstack marketplace web application clone.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-airbnb-dark antialiased">
        {children}
      </body>
    </html>
  );
}
