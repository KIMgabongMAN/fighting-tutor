import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Semi Turn Fighter Prototype",
  description: "반턴제 격투 테스트버전"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}