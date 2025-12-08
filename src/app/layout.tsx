import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Source_Code_Pro } from 'next/font/google'
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QRmenu - Restaurant Management System',
  description: 'Modern AI-powered restaurant management with QR code ordering',
};

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const fontSourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-code',
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" data-scroll-behavior="smooth">
      <body className={cn(
        "min-h-screen bg-background text-foreground antialiased",
        "font-sans leading-relaxed",
        fontInter.variable,
        fontSourceCodePro.variable
      )}>
        <div className="relative min-h-screen flex flex-col">
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
