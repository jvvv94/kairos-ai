import './globals.css';
import type { Metadata } from 'next';
import Header from './components/Header';

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
        <link rel="icon" href="/kairos-favicon.png" type="image/png" />
        <meta name="google-adsense-account" content="ca-pub-2932774121154983" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2932774121154983"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
} 