// app/layout.js - Improved layout structure
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Providers from './provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Job Portal',
  description: 'A professional job portal built with Next.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
