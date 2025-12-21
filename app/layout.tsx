import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/contexts/CartContext'

export const metadata: Metadata = {
  title: 'eBay Clone',
  description: 'Auction platform with real-time bidding',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}

