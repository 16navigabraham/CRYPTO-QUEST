import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { PrivyProviderWrapper } from '@/components/PrivyProvider';
import { ThemeProvider } from '@/components/ThemeProvider';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'CryptoQuest - Master Web3 Development',
    template: `%s | CryptoQuest`,
  },
  description: 'CryptoQuest is a gamified learning platform that makes mastering complex blockchain concepts fun and interactive. Take quizzes, earn points, and become a Web3 expert.',
  keywords: ['Crypto', 'Web3', 'Blockchain', 'Developer', 'Education', 'Quiz', 'Gamified Learning', 'Smart Contracts', 'Solidity'],
  openGraph: {
    title: 'CryptoQuest - Master Web3 Development, One Quest at a Time',
    description: 'A gamified learning platform for developers to master blockchain concepts and earn on-chain rewards.',
    url: siteUrl,
    siteName: 'CryptoQuest',
    images: [
      {
        url: '/cat.jpg',
        width: 1200,
        height: 630,
        alt: 'A heroic cat on a quest for crypto knowledge.',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoQuest - Master Web3 Development',
    description: 'Learn Web3, take quizzes, earn crypto. Your adventure into blockchain development starts here.',
    images: [`${siteUrl}/cat.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <PrivyProviderWrapper>
            {children}
            </PrivyProviderWrapper>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
