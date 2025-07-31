import JobSeekerNavBar from '@/components/Navbars/JobSeekerNavBar'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'LinkedIn Clone',
    description: 'A LinkedIn clone built with Next.js',
}

export default function JobSeekerLayout({ children }) {
    return (
        <>
            <JobSeekerNavBar />
            <main>{children}</main>
        </>
    )
}