// GET /api/recruiter/dashboard/upcoming-interviews
// - Next 2-3 interviews where interviewerId = currentUser.id
// - Status = SCHEDULED, scheduledAt > now()
// - Include candidate and job details

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const recruiterId = session.user.id;
        const now = new Date();

        // Next 2-3 interviews where interviewerId = currentUser.id
        // Status = SCHEDULED, scheduledAt > now()
        // Include candidate and job details
        const upcomingInterviews = await prisma.interview.findMany({
            where: {
                interviewerId: recruiterId,
                status: 'SCHEDULED',
                scheduledAt: {
                    gt: now
                }
            },
            include: {
                candidate: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profileImage: true
                    }
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                        location: true
                    }
                }
            },
            orderBy: {
                scheduledAt: 'asc'
            },
            take: 3
        });

        // Transform data to match dashboard format
        const transformedInterviews = upcomingInterviews.map(interview => {
            const interviewDate = new Date(interview.scheduledAt);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            let dateLabel = 'Today';
            if (interviewDate.toDateString() === tomorrow.toDateString()) {
                dateLabel = 'Tomorrow';
            } else if (interviewDate.toDateString() !== today.toDateString()) {
                dateLabel = interviewDate.toLocaleDateString();
            }

            return {
                id: interview.id,
                candidate: `${interview.candidate.firstName} ${interview.candidate.lastName}`,
                position: interview.job.title,
                time: interviewDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }),
                date: dateLabel,
                scheduledAt: interview.scheduledAt
            };
        });

        return NextResponse.json(transformedInterviews, { status: 200 });

    } catch (error) {
        console.error('Error fetching upcoming interviews:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}