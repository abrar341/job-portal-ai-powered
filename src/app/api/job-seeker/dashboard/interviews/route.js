// / app/api / dashboard / interviews / route.js - Upcoming Interviews
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

        const interviews = await prisma.interview.findMany({
            where: {
                candidateId: session.user.id,
                status: 'SCHEDULED',
                scheduledAt: {
                    gte: new Date() // Only future interviews
                }
            },
            orderBy: {
                scheduledAt: 'asc'
            },
            include: {
                job: {
                    select: {
                        title: true,
                        location: true
                    }
                },
                interviewer: {
                    select: {
                        companyName: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        // Format the response
        const formattedInterviews = interviews.map(interview => ({
            id: interview.id,
            company: interview.interviewer.companyName || `${interview.interviewer.firstName} ${interview.interviewer.lastName}`,
            position: interview.job.title,
            date: interview.scheduledAt.toLocaleDateString(),
            time: interview.scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            scheduledAt: interview.scheduledAt,
            duration: interview.duration
        }));

        return NextResponse.json(formattedInterviews, { status: 200 });
    } catch (error) {
        console.error('Error fetching interviews:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}