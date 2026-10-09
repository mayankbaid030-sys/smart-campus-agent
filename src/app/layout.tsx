import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sapthagiri NPS University | Voice AI Campus Agent',
  description:
    'Gen Z voice-first campus intelligence for Sapthagiri NPS University. Live faculty radar, multi-language speech AI, and smart campus automation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#0B0B12] text-slate-100 font-sans antialiased selection:bg-pink-500/30 selection:text-pink-200">
        {children}
      </body>
    </html>
  );
}
