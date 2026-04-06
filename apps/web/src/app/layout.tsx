import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RudraX Unified Scientific Community Platform",
  description: "Collaboration-first scientific infrastructure for PhysicX, ChemistrY, and MathematicX.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
