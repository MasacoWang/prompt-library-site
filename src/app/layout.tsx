import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CodeProtection from '@/components/CodeProtection';
import AuthProvider from '@/components/AuthProvider';
import FloatingFavorites from '@/components/FloatingFavorites';

export const metadata: Metadata = {
  title: 'AI Recruiter Toolkit',
  description: 'Prompts, templates, and AI tools to speed up recruiting workflows.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-surface-alt text-text-primary min-h-screen flex flex-col">
        <AuthProvider>
          <CodeProtection />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingFavorites />
        </AuthProvider>
      </body>
    </html>
  );
}
