import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { RiHomeLine } from "@remixicon/react";
import Link from "next/link";

const geistHeading = Geist({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "IKNL",
  description: "IKNL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable, geistHeading.variable)}
    >
      <body className="min-h-full flex flex-col">
              <div className="w-full h-20 bg-[#11B5E9] flex flex-row items-center  ">
                <Link href={"/"}>
                < RiHomeLine className="size-10 text-white ml-10 hover:cursor-pointer hover:text-[#006D8C] transition-colors ease-in-out" />
                </Link>
      </div>
        {children}</body>
    </html>
  );
}
