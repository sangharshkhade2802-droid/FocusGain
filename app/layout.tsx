import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FocusGain — Enterprise Deep Focus & AI-Driven Learning Platform',
  description: 'Master your attention with intelligent study timers, feed shields, multiplayer focus rooms, and Gemini-powered 20-MCQ diagnostics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#030712] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
