import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ChatOverviewWidget from "@/components/ChatOverviewWidget";
import PageTasksDropdown from "@/components/PageTasksDropdown";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LMS Admin – Assessment Center",
  description: "Learning Management System – Assessment Center Redesign",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <PageTasksDropdown />
        <ChatOverviewWidget />
      </body>
    </html>
  );
}
