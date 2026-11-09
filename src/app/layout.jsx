
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
// import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata = {
  title: "TestPay — Fake Money. Real Payment Flows.",
  description:
    "A developer-friendly payment sandbox for test tokens, wallets, payment links, webhooks, and API integrations.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      {/* <Navbar /> */}
      <body className="min-h-full flex flex-col font-sans">
        {children}

        <Toaster
          position="top-right"
          theme="dark"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
