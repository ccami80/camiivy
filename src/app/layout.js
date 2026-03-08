import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/helper/ReduxProvider";
import { MswProvider } from "@/components/MswProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CAMI",
  description: "강아지 프리미엄 반려동물 이커머스",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <MswProvider>
            {children}
          </MswProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
