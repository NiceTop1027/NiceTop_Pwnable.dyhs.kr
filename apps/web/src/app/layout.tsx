import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "@/components/layout/Header";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";
import "@/styles/content.css";

const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "100 900",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "pwnable.dyhs.kr",
    template: "%s | pwnable.dyhs.kr",
  },
  description:
    "한국 학생을 위한 포너블 올인원 교육 플랫폼 — 강의, 워게임, CTF, 커뮤니티",
  keywords: ["pwnable", "CTF", "해킹", "보안", "교육", "워게임", "포너블"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <ConditionalFooter />
        </AuthProvider>
      </body>
    </html>
  );
}