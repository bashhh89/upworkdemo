import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from "sonner"
import { ThemeProvider } from "next-themes"
import { cn } from "@/lib/utils"

// Import buffer shim if it exists
try {
  await import('@/lib/buffer-shim');
} catch {
  console.warn("buffer-shim not found, skipping import");
}

export const metadata: Metadata = {
  title: 'Deliver AI Assistant',
  description: 'AI-powered marketing and sales assistant',
}

type RootLayoutProps = {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased theme-default"
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
