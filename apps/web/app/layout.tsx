import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/theme-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'ResumeForge — Precision ATS Resume Platform',
  description:
    'Professional resume platform with full LaTeX Code Editor, ATS-approved structured generator, and secure isolated compiler sandbox.',
  keywords: ['Resume', 'LaTeX', 'ATS Resume', 'Resume Builder', 'Monaco Code Editor', 'pdflatex'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
