import RecruiterNavBar from '@/components/Navbars/RecruiterNavBar'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'LinkedIn Clone',
    description: 'A LinkedIn clone built with Next.js',
}

export default function RecruiterLayout({ children }) {
    return (
        <>
            <RecruiterNavBar />
            <main>{children}</main>
        </>
    )
}