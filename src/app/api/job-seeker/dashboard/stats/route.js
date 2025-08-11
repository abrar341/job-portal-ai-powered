// app/api/job-seeker/dashboard/stats/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Get all stats in parallel
        const [totalApplications, interviewsScheduled, rejections, hired] = await Promise.all([
            // Total applications
            prisma.application.count({
                where: { applicantId: userId }
            }),
            // Interviews scheduled
            prisma.interview.count({
                where: {
                    candidateId: userId,
                    status: 'SCHEDULED'
                }
            }),
            // Rejections
            prisma.application.count({
                where: {
                    applicantId: userId,
                    status: 'REJECTED'
                }
            }),
            // Hired
            prisma.application.count({
                where: {
                    applicantId: userId,
                    status: 'HIRED'
                }
            })
        ]);

        const stats = {
            totalApplications,
            interviewsScheduled,
            rejections,
            hired
        };

        return NextResponse.json(stats, { status: 200 });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}