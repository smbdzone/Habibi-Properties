import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ToastContainer } from "react-toastify";
import { AboutProvider } from "@/components/context/AboutContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Habibi Properties | Dubai Real Estate",
  description:
    "Discover premium residential and commercial properties in Dubai with Habibi Properties. Explore new projects, investment opportunities, and properties tailored to your needs.",
  icons: {
    icon: "/images/logo.webp",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <AboutProvider>
        <body className="min-h-full flex flex-col">
          <Navbar />
          <main className="min-h-full">
            {children}
            <ToastContainer />
          </main>
          <Footer />
        </body>
      </AboutProvider>
    </html>
  );
}
