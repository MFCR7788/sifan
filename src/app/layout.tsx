import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import ChatBox from "@/components/ChatBox";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";
import { SITE } from '@/lib/site';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "路耐 LUNAI · 浙江思杋服饰有限公司 | 山高路远·一件路耐",
  description:
    `浙江思杋服饰有限公司旗下「路耐 LUNAI」主品牌，下设路耐少年与路耐户外两条产品系列。一个主品牌、两条产品系列、六大运营模块、一个可复制的 50 ㎡ 双品类单店模型。加盟热线 ${SITE.hotline}。`,
  keywords: [
    "路耐",
    "LUNAI",
    "浙江思杋服饰",
    "校服",
    "冲锋衣",
    "户外装备",
    "加盟",
    "店中店",
    "智慧零售",
  ],
  openGraph: {
    title: "路耐 LUNAI · 山高路远·一件路耐",
    description:
      "一个主品牌，两条产品系列，六大运营模块，一个可复制的单店模型。",
    url: "https://www.zjsifan.com",
    siteName: "路耐 LUNAI",
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToastProvider>
            {children}
            <ChatBox />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
