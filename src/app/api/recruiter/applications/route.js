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
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');

        // Base query for applications
        const whereClause = {
            job: {
                postedById: recruiterId,
            },
        };

        // Add jobId filter if provided
        if (jobId) {
            whereClause.jobId = jobId;
        }

        const applications = await prisma.application.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                applicant: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        profileImage: true,
                        resume: true,
                        location: true,
                        skills: true,
                        experience: true,
                        education: true,
                    },
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                        location: true,
                        jobType: true,
                    },
                },
            },
        });

        // If jobId is provided, also return job details
        let jobDetails = null;
        if (jobId) {
            jobDetails = await prisma.job.findUnique({
                where: {
                    id: jobId,
                    postedById: recruiterId // Ensure recruiter can only access their own jobs
                },
                select: {
                    id: true,
                    title: true,
                    location: true,
                    jobType: true,
                    description: true,
                    createdAt: true,
                }
            });

            if (!jobDetails) {
                return NextResponse.json({ error: 'Job not found' }, { status: 404 });
            }
        }

        // Return in the format expected by your frontend
        if (jobId) {
            return NextResponse.json({
                applications,
                job: jobDetails,
                count: applications.length
            }, { status: 200 });
        } else {
            return NextResponse.json(applications, { status: 200 });
        }

    } catch (error) {
        console.error('Error fetching recruiter applications:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
