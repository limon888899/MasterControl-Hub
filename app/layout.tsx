import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Global Migration Hub',
  description: 'A secure workspace for migration applications and client documents.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}