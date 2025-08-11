// app/api/recruiter/interviews/route.js

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

// POST - Schedule a new interview
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const recruiterId = session.user.id;
        const { applicationId, scheduledAt, duration, notes } = await request.json();

        // Validation
        if (!applicationId || !scheduledAt) {
            return NextResponse.json({
                message: 'Application ID and scheduled date are required'
            }, { status: 400 });
        }

        // Validate scheduledAt is a future date
        const interviewDate = new Date(scheduledAt);
        if (interviewDate <= new Date()) {
            return NextResponse.json({
                message: 'Interview must be scheduled for a future date'
            }, { status: 400 });
        }

        // Check if application exists and belongs to recruiter's job
        const application = await prisma.application.findFirst({
            where: {
                id: applicationId,
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
                        email: true
                    }
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                        location: true
                    }
                }
            }
        });

        if (!application) {
            return NextResponse.json({ message: 'Application not found' }, { status: 404 });
        }

        // Check if interview already exists for this application
        const existingInterview = await prisma.interview.findFirst({
            where: {
                applicationId: applicationId,
                status: {
                    in: ['SCHEDULED', 'COMPLETED']
                }
            }
        });

        if (existingInterview) {
            return NextResponse.json({
                message: 'Interview already scheduled for this application'
            }, { status: 409 });
        }

        // Create interview
        const interview = await prisma.interview.create({
            data: {
                applicationId: applicationId,
                jobId: application.job.id,
                interviewerId: recruiterId,
                candidateId: application.applicant.id,
                scheduledAt: interviewDate,
                duration: duration || 60, // Default 60 minutes
                notes: notes || '',
                status: 'SCHEDULED'
            },
            include: {
                application: {
                    include: {
                        applicant: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                },
                job: {
                    select: {
                        title: true,
                        location: true
                    }
                }
            }
        });

        // Update application status to INTERVIEW_SCHEDULED
        await prisma.application.update({
            where: {
                id: applicationId
            },
            data: {
                status: 'INTERVIEW_SCHEDULED'
            }
        });

        return NextResponse.json({
            message: 'Interview scheduled successfully',
            interview: interview
        }, { status: 201 });

    } catch (error) {
        console.error('Error scheduling interview:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// GET - Fetch interviews for recruiter
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const recruiterId = session.user.id;
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // Optional filter by status

        const whereClause = {
            interviewerId: recruiterId
        };

        if (status) {
            whereClause.status = status;
        }

        const interviews = await prisma.interview.findMany({
            where: whereClause,
            orderBy: {
                scheduledAt: 'asc'
            },
            include: {
                application: {
                    include: {
                        applicant: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                profileImage: true
                            }
                        }
                    }
                },
                job: {
                    select: {
                        title: true,
                        location: true,
                        jobType: true
                    }
                }
            }
        });

        return NextResponse.json(interviews, { status: 200 });

    } catch (error) {
        console.error('Error fetching interviews:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}