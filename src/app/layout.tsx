import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import HomeNavWrapper from '@/components/HomeNavWrapper'

// Import buffer shim if it exists
try {
  require('@/lib/buffer-shim');
} catch (e) {
  console.warn("buffer-shim not found, skipping import");
}

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Deliver AI Assistant',
  description: 'AI-powered marketing and sales assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} h-screen dark bg-[#0a0a0a]`}>
        {children}
        <HomeNavWrapper />
        <Toaster />
      </body>
    </html>
  )
}
