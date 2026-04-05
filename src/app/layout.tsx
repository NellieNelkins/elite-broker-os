import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { KeyboardShortcuts } from "@/components/layout/keyboard-shortcuts";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elite Broker OS — Dubai Real Estate CRM",
  description:
    "AI-powered real estate broker platform for Dubai. Manage contacts, pipeline, listings, WhatsApp campaigns, and get AI coaching.",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[var(--bg-deepest)]">
        <KeyboardShortcuts />
        <Sidebar />
        <div className="flex min-h-screen flex-col md:ml-60">
          <Header />
          <main className="flex-1 px-6 py-5">{children}</main>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
            },
          }}
        />
      </body>
    </html>
  );
}
