import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
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

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CareerHub — Connect, Grow & Get Hired",
  description:
    "CareerHub is the ultimate professional network. Build your profile, share posts, connect with peers, and land your dream job.",
  keywords: [
    "career",
    "jobs",
    "networking",
    "professional",
    "LinkedIn alternative",
    "ATS resume",
    "job search",
  ],
  openGraph: {
    title: "CareerHub — Connect, Grow & Get Hired",
    description:
      "Build your profile, connect with top professionals, and get hired faster.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#0F172A] text-slate-100 transition-colors duration-300">
        <StoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange={false}
          >
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
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                borderRadius: "14px",
                color: "#e2e8f0",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.875rem",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
              }}
            />
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
