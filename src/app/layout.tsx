import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dominion Card Viewer",
  description: "Browse Dominion cards and randomize balanced 10-card kingdoms",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
