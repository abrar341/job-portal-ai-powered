// app/api/recruiter/applications/[id]/status/route.js

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const recruiterId = session.user.id;
        const applicationId = params.id;
        const { status } = await request.json();

        // Validate status
        const validStatuses = ['APPLIED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'REJECTED', 'HIRED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
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
                job: {
                    select: {
                        title: true,
                        postedById: true
                    }
                },
                applicant: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        if (!application) {
            return NextResponse.json({ message: 'Application not found' }, { status: 404 });
        }

        // Use transaction to handle status update and interview cancellation
        const result = await prisma.$transaction(async (tx) => {
            // If declining application, cancel any scheduled interviews
            if (status === 'REJECTED') {
                await tx.interview.updateMany({
                    where: {
                        applicationId: applicationId,
                        status: 'SCHEDULED'
                    },
                    data: {
                        status: 'CANCELLED'
                    }
                });
            }

            // Update application status
            const updatedApplication = await tx.application.update({
                where: {
                    id: applicationId
                },
                data: {
                    status: status,
                    reviewedAt: status === 'REVIEWED' ? new Date() : application.reviewedAt
                },
                include: {
                    applicant: {
                        select: {
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
                            location: true,
                            jobType: true
                        }
                    }
                }
            });

            return updatedApplication;
        });

        return NextResponse.json({
            message: status === 'REJECTED'
                ? 'Application declined and scheduled interviews cancelled'
                : 'Application status updated successfully',
            application: result
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating application status:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}