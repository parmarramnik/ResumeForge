import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'ResumeForge — Production-Quality LaTeX Resume Platform',
  description:
    'Professional resume platform with full LaTeX Monaco IDE, ATS-approved structured generator, and secure isolated compiler sandbox.',
  keywords: ['Resume', 'LaTeX', 'ATS Resume', 'Resume Builder', 'Monaco LaTeX Editor', 'Tectonic'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
