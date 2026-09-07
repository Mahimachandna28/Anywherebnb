import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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
      <body className="min-h-screen flex flex-col bg-white text-airbnb-dark antialiased">
        <UserProvider>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
