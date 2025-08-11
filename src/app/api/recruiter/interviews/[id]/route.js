// app/api/recruiter/interviews/[id]/route.js

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

// PATCH - Update interview (reschedule, update status, add feedback)
export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const recruiterId = session.user.id;
        const interviewId = params.id;
        const { scheduledAt, duration, notes, feedback, status } = await request.json();

        // Check if interview exists and belongs to recruiter
        const interview = await prisma.interview.findFirst({
            where: {
                id: interviewId,
                interviewerId: recruiterId
            }
        });

        if (!interview) {
            return NextResponse.json({ message: 'Interview not found' }, { status: 404 });
        }

        // Validate status if provided
        const validStatuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        // Validate scheduledAt if provided (should be future date for rescheduling)
        if (scheduledAt) {
            const newDate = new Date(scheduledAt);
            if (newDate <= new Date() && status !== 'COMPLETED') {
                return NextResponse.json({
                    message: 'Interview must be scheduled for a future date'
                }, { status: 400 });
            }
        }

        // Prepare update data
        const updateData = {};
        if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);
        if (duration) updateData.duration = duration;
        if (notes !== undefined) updateData.notes = notes;
        if (feedback !== undefined) updateData.feedback = feedback;
        if (status) updateData.status = status;

        // Update interview
        const updatedInterview = await prisma.interview.update({
            where: {
                id: interviewId
            },
            data: updateData,
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

        return NextResponse.json({
            message: 'Interview updated successfully',
            interview: updatedInterview
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating interview:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// DELETE - Cancel interview
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const recruiterId = session.user.id;
        const interviewId = params.id;

        // Check if interview exists and belongs to recruiter
        const interview = await prisma.interview.findFirst({
            where: {
                id: interviewId,
                interviewerId: recruiterId
            }
        });

        if (!interview) {
            return NextResponse.json({ message: 'Interview not found' }, { status: 404 });
        }

        // Update interview status to CANCELLED instead of deleting
        await prisma.interview.update({
            where: {
                id: interviewId
            },
            data: {
                status: 'CANCELLED'
            }
        });

        // Optionally update application status back to SHORTLISTED
        await prisma.application.update({
            where: {
                id: interview.applicationId
            },
            data: {
                status: 'SHORTLISTED'
            }
        });

        return NextResponse.json({
            message: 'Interview cancelled successfully'
        }, { status: 200 });

    } catch (error) {
        console.error('Error cancelling interview:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}