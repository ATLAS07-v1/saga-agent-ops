import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saga Agent Ops",
  description: "Saga Teknoloji AI company operating system"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
