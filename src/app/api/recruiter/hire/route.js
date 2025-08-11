// app/api/recruiter/hire/route.js

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

// POST - Create hiring decision
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const recruiterId = session.user.id;
        const { applicationId, startDate, salary, position, notes } = await request.json();

        // Validation
        if (!applicationId || !startDate || !position) {
            return NextResponse.json({
                message: 'Application ID, start date, and position are required'
            }, { status: 400 });
        }

        // Validate startDate is a future date
        const hireStartDate = new Date(startDate);
        if (hireStartDate <= new Date()) {
            return NextResponse.json({
                message: 'Start date must be in the future'
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
                },
                hire: true // Check if already hired
            }
        });

        if (!application) {
            return NextResponse.json({ message: 'Application not found' }, { status: 404 });
        }

        // Check if candidate is already hired for this application
        if (application.hire) {
            return NextResponse.json({
                message: 'Candidate already hired for this application'
            }, { status: 409 });
        }

        // Create hire record using transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create hire record
            const hire = await tx.hire.create({
                data: {
                    applicationId: applicationId,
                    startDate: hireStartDate,
                    salary: salary || null,
                    position: position,
                    notes: notes || ''
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
                            },
                            job: {
                                select: {
                                    title: true,
                                    location: true
                                }
                            }
                        }
                    }
                }
            });

            // Update application status to HIRED
            await tx.application.update({
                where: {
                    id: applicationId
                },
                data: {
                    status: 'HIRED'
                }
            });

            // Update any scheduled interviews for this application to COMPLETED
            await tx.interview.updateMany({
                where: {
                    applicationId: applicationId,
                    status: 'SCHEDULED'
                },
                data: {
                    status: 'COMPLETED'
                }
            });

            return hire;
        });

        return NextResponse.json({
            message: 'Candidate hired successfully',
            hire: result
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating hire record:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// GET - Fetch all hires for recruiter
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const recruiterId = session.user.id;

        const hires = await prisma.hire.findMany({
            where: {
                application: {
                    job: {
                        postedById: recruiterId
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                application: {
                    include: {
                        applicant: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                profileImage: true,
                                phone: true,
                                location: true
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
                }
            }
        });

        return NextResponse.json(hires, { status: 200 });

    } catch (error) {
        console.error('Error fetching hires:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}