import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sapthagiri NPS University - Voice AI Campus Agent',
  description: 'Voice-first multilingual AI campus assistant with live faculty locator radar, attendance tracker, bus schedules, notes, and academic reminders.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
