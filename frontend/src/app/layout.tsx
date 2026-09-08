import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { ToastProvider } from "@/context/ToastContext";
import { FilterProvider } from "@/context/FilterContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FilterModal } from "@/components/listings/FilterModal";
import { ToastContainer } from "@/components/ui";

export const metadata: Metadata = {
  title: "Anywherebnb: Vacation Rentals, Cabins, Beach Houses & More",
  description: "Find vacation rentals, cabins, beach houses, unique homes and experiences around the world on Anywherebnb.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('anywherebnb_theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-[#121212] text-airbnb-dark dark:text-neutral-100 antialiased transition-colors duration-200">
        <ThemeProvider>
          <UserProvider>
            <ToastProvider>
              <WishlistProvider>
                <FilterProvider>
                  <Navbar />
                  <div className="flex-1">
                    {children}
                  </div>
                  <Footer />
                  <FilterModal />
                  <ToastContainer />
                </FilterProvider>
              </WishlistProvider>
            </ToastProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
