"use client";
import { Inter } from "next/font/google";
import { useEffect } from "react";
import "./globals.css";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => console.log("Service Worker registered with scope:", registration.scope))
        .catch((err) => console.error("Service Worker registration failed:", err));
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Unified Scholarship Portal</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ea580c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/assets/logo.jpg" />
      </head>
      <body className={inter.className}>
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
}