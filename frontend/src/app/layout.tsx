import type { Metadata } from "next";
import type React from "react";
import "../../styles/index.css";
import "../../styles/App.css";
import ClientShell from "@/components/ClientShell";

export const metadata: Metadata = {
  title: "Laxmi Edible Oils",
  description: "Jaipur-based edible oils, lab-tested and shipped pan-India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
