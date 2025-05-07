import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kairos - Best AI Interview',
  description: 'AI 면접관과 함께하는 실전 면접 연습 서비스',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo.svg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="google-adsense-account" content="ca-pub-2932774121154983" />
      </head>
      <body>{children}</body>
    </html>
  );
} 