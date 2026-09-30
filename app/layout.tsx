import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-fredoka" });

export const metadata: Metadata = {
  title: "Meme Mood AI 😂 Face Emotion Detector",
  description: "Hilarious real-time face emotion detection powered by Next.js & Vercel Python Serverless AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fredoka.variable}`}>
      <body className="antialiased bg-slate-950 text-white min-h-screen selection:bg-yellow-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}
