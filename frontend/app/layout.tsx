import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { TicketProvider } from '../contexts/TicketContext';
import { ResultProvider } from '../contexts/ResultContext';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from './_source/components/Header';
import { GoogleAnalytics } from '@next/third-parties/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '내티켓',
  description: '티켓팅 연습',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <QueryProvider>
          <AuthProvider>
            <ResultProvider>
              <TicketProvider>{children}</TicketProvider>
            </ResultProvider>
          </AuthProvider>
        </QueryProvider>
        <Toaster />
      </body>

      <GoogleAnalytics gaId="G-MJVW856FVF" />
    </html>
  );
}
