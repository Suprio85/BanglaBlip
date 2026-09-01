import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_Bengali } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoBengali = Noto_Sans_Bengali({ subsets: ["bengali"], variable: "--font-bengali" });

export const metadata: Metadata = {
  title: 'Bangla Image Captioning Demo',
  description: 'AI-powered image captioning in Bangla with real-time streaming output',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#6366f1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn">
      <body className={`${inter.variable} ${notoBengali.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
