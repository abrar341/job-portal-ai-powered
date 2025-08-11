// app/api/recruiter/applications/route.js

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

        // Extract query parameters
        const jobId = searchParams.get('jobId');
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;

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

        // Add status filter if provided
        if (status && isValidStatus(status)) {
            whereClause.status = status;
        }

        // Calculate skip for pagination
        const skip = (page - 1) * limit;

        // Fetch applications with filters
        const [applications, totalCount] = await Promise.all([
            prisma.application.findMany({
                where: whereClause,
                skip: skip,
                take: limit,
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
                    interviews: {
                        select: {
                            id: true,
                            scheduledAt: true,
                            status: true,
                            duration: true,
                        },
                        orderBy: {
                            scheduledAt: 'desc',
                        },
                        take: 1, // Get latest interview
                    },
                    hire: {
                        select: {
                            id: true,
                            startDate: true,
                            salary: true,
                            position: true,
                            createdAt: true,
                        },
                    },
                },
            }),
            prisma.application.count({
                where: whereClause,
            })
        ]);

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

        // Get status counts for dashboard/filter statistics
        const statusCounts = await getStatusCounts(recruiterId, jobId);

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        // Return response with pagination and filtering info
        const response = {
            applications,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage,
                hasPrevPage,
                limit,
            },
            filters: {
                status: status || 'all',
                jobId: jobId || 'all',
            },
            statusCounts,
        };

        // Include job details if requested
        if (jobDetails) {
            response.job = jobDetails;
        }

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error('Error fetching recruiter applications:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// Helper function to validate status parameter
function isValidStatus(status) {
    const validStatuses = [
        'APPLIED',
        'REVIEWED',
        'SHORTLISTED',
        'INTERVIEW_SCHEDULED',
        'REJECTED',
        'HIRED'
    ];
    return validStatuses.includes(status.toUpperCase());
}

// Helper function to get counts for each status
async function getStatusCounts(recruiterId, jobId = null) {
    const baseWhere = {
        job: {
            postedById: recruiterId,
        },
    };

    if (jobId) {
        baseWhere.jobId = jobId;
    }

    try {
        const [
            allCount,
            appliedCount,
            reviewedCount,
            shortlistedCount,
            interviewScheduledCount,
            rejectedCount,
            hiredCount
        ] = await Promise.all([
            prisma.application.count({ where: baseWhere }),
            prisma.application.count({ where: { ...baseWhere, status: 'APPLIED' } }),
            prisma.application.count({ where: { ...baseWhere, status: 'REVIEWED' } }),
            prisma.application.count({ where: { ...baseWhere, status: 'SHORTLISTED' } }),
            prisma.application.count({ where: { ...baseWhere, status: 'INTERVIEW_SCHEDULED' } }),
            prisma.application.count({ where: { ...baseWhere, status: 'REJECTED' } }),
            prisma.application.count({ where: { ...baseWhere, status: 'HIRED' } }),
        ]);

        return {
            all: allCount,
            applied: appliedCount,
            reviewed: reviewedCount,
            shortlisted: shortlistedCount,
            interview_scheduled: interviewScheduledCount,
            rejected: rejectedCount,
            hired: hiredCount,
        };
    } catch (error) {
        console.error('Error getting status counts:', error);
        return {};
    }
}