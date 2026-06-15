import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "../store/StoreProvider";
import ThemeProvider from "../components/ThemeProvider";
import AuthGuard from "../components/AuthGuard";
import Navbar from "../components/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareerHub — Connect, Grow & Get Hired",
  description:
    "CareerHub is the ultimate professional network. Build your profile, share posts, connect with peers, and land your dream job.",
  keywords: ["career", "jobs", "networking", "professional", "LinkedIn alternative"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#0F172A] text-slate-100 transition-colors duration-200">
        <StoreProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <AuthGuard>
              <Navbar />
              <div className="flex-grow flex flex-col relative z-10">
                {children}
              </div>
            </AuthGuard>
            <ToastContainer
              position="top-right"
              autoClose={3500}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              draggable
              theme="dark"
              toastStyle={{
                background: "rgba(15, 23, 42, 0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                borderRadius: "12px",
                color: "#e2e8f0",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.9rem",
              }}
            />
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
