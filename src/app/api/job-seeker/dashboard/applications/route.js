// / app/api/dashboard/applications/route.js - Recent Applications
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

        const applications = await prisma.application.findMany({
            where: {
                applicantId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10, // Recent 10 applications
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        location: true,
                        jobType: true,
                        postedBy: {
                            select: {
                                companyName: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                },
            },
        });

        // Format the response
        const formattedApplications = applications.map(app => ({
            id: app.id,
            company: app.job.postedBy.companyName || `${app.job.postedBy.firstName} ${app.job.postedBy.lastName}`,
            position: app.job.title,
            appliedDate: app.createdAt,
            status: app.status,
            location: app.job.location,
            jobType: app.job.jobType
        }));

        return NextResponse.json(formattedApplications, { status: 200 });
    } catch (error) {
        console.error('Error fetching applications:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}