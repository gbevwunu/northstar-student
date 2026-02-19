import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NorthStar Student | International Student Compliance for Manitoba',
  description:
    'Protect your study permit status. Track work hours, compliance deadlines, and tenancy rights in Winnipeg.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
