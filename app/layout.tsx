import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tomo Expedition",
  description: "Parent-first family finance onboarding for Tomo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-transparent text-[#3e3128]">
        {children}
      </body>
    </html>
  );
}
