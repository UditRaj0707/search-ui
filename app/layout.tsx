import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Search UI',
  description: 'Search interface with AI chat',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

