import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Evangelism App - Your Spiritual Journey',
  description: 'A modern platform for spiritual guidance, mentorship, and church connections',
  keywords: 'evangelism, spiritual guidance, mentorship, church, faith, christian',
  authors: [{ name: 'Evangelism App Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}


