// GET /api/recruiter/dashboard/stats
// - Total jobs count (where postedById = currentUser.id)
// - Total applications count (join Job -> Application where Job.postedById = currentUser.id)
// - Total interviews count (where interviewerId = currentUser.id)
// - Total hired count (join Application -> Hire where job postedBy = currentUser.id)

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

        // Total jobs count (where postedById = currentUser.id)
        const totalJobs = await prisma.job.count({
            where: {
                postedById: recruiterId
            }
        });

        // Total applications count (join Job -> Application where Job.postedById = currentUser.id)
        const totalApplications = await prisma.application.count({
            where: {
                job: {
                    postedById: recruiterId
                }
            }
        });

        // Total interviews count (where interviewerId = currentUser.id)
        const totalInterviews = await prisma.interview.count({
            where: {
                interviewerId: recruiterId
            }
        });

        // Total hired count (join Application -> Hire where job postedBy = currentUser.id)
        const totalHired = await prisma.hire.count({
            where: {
                application: {
                    job: {
                        postedById: recruiterId
                    }
                }
            }
        });

        const stats = {
            totalJobs,
            totalApplications,
            interviewsScheduled: totalInterviews,
            hiredCandidates: totalHired
        };

        return NextResponse.json(stats, { status: 200 });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}