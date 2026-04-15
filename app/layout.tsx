import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "@/styles/globals.css";

const openSans = Open_Sans({ 
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-open-sans"
});

export const metadata: Metadata = {
  title: "NCS Kudos & Rewards",
  description: "Hệ thống tri ân và đổi quà nội bộ NCS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${openSans.variable} font-sans`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
