import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AuraAdmin Panel - Standalone Admin Portal',
  description: 'AuraAdmin Blog Post Management Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
