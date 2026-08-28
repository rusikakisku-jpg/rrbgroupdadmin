import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RRB Group D Answer Key - Admin Portal',
  description: 'RRB Group D Answer Key Management Dashboard',
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
