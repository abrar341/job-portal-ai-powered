
// GET /api/recruiter/dashboard/recent-applications
// - Latest 3 applications with applicant details
// - Join Job -> Application -> User where Job.postedById = currentUser.id
// - Order by Application.createdAt DESC

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

        // Latest 3 applications with applicant details
        // Join Job -> Application -> User where Job.postedById = currentUser.id
        // Order by Application.createdAt DESC
        const recentApplications = await prisma.application.findMany({
            where: {
                job: {
                    postedById: recruiterId
                }
            },
            include: {
                applicant: {
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
                        title: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 3
        });

        // Transform data to match dashboard format
        const transformedApplications = recentApplications.map(app => ({
            id: app.id,
            name: `${app.applicant.firstName} ${app.applicant.lastName}`,
            position: app.job.title,
            status: app.status.toLowerCase(),
            avatar: app.applicant.firstName.charAt(0) + app.applicant.lastName.charAt(0),
            profileImage: app.applicant.profileImage,
            createdAt: app.createdAt
        }));

        return NextResponse.json(transformedApplications, { status: 200 });

    } catch (error) {
        console.error('Error fetching recent applications:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}