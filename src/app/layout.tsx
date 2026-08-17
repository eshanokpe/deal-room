import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deal Room",
  description: "Share fundraising documents with investors and track engagement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}