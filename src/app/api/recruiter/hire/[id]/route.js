// app/api/recruiter/hire/[id]/route.js

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

// PATCH - Update hire details
export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const recruiterId = session.user.id;
        const hireId = params.id;
        const { startDate, salary, position, notes } = await request.json();

        // Check if hire exists and belongs to recruiter
        const hire = await prisma.hire.findFirst({
            where: {
                id: hireId,
                application: {
                    job: {
                        postedById: recruiterId
                    }
                }
            }
        });

        if (!hire) {
            return NextResponse.json({ message: 'Hire record not found' }, { status: 404 });
        }

        // Validate startDate if provided
        if (startDate) {
            const newStartDate = new Date(startDate);
            if (newStartDate <= new Date()) {
                return NextResponse.json({
                    message: 'Start date must be in the future'
                }, { status: 400 });
            }
        }

        // Prepare update data
        const updateData = {};
        if (startDate) updateData.startDate = new Date(startDate);
        if (salary !== undefined) updateData.salary = salary;
        if (position) updateData.position = position;
        if (notes !== undefined) updateData.notes = notes;

        // Update hire record
        const updatedHire = await prisma.hire.update({
            where: {
                id: hireId
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

        return NextResponse.json({
            message: 'Hire record updated successfully',
            hire: updatedHire
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating hire record:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// DELETE - Cancel hire (revert hiring decision)
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const recruiterId = session.user.id;
        const hireId = params.id;

        // Check if hire exists and belongs to recruiter
        const hire = await prisma.hire.findFirst({
            where: {
                id: hireId,
                application: {
                    job: {
                        postedById: recruiterId
                    }
                }
            }
        });

        if (!hire) {
            return NextResponse.json({ message: 'Hire record not found' }, { status: 404 });
        }

        // Use transaction to revert hiring decision
        await prisma.$transaction(async (tx) => {
            // Delete hire record
            await tx.hire.delete({
                where: {
                    id: hireId
                }
            });

            // Update application status back to previous state (e.g., SHORTLISTED)
            await tx.application.update({
                where: {
                    id: hire.applicationId
                },
                data: {
                    status: 'SHORTLISTED' // or determine appropriate previous status
                }
            });
        });

        return NextResponse.json({
            message: 'Hire decision cancelled successfully'
        }, { status: 200 });

    } catch (error) {
        console.error('Error cancelling hire:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}