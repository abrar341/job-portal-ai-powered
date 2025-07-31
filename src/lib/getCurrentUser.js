// lib/getCurrentUser.js - Improved server-side user fetching
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function getCurrentUser() {
    try {
        const session = await getServerSession(authOptions);
        return session?.user || null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}