import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_, { params }) {
    const jobId = params.id;

    try {
        const applications = await prisma.application.findMany({
            where: { jobId },
            include: {
                applicant: {
                    select: {
                        id,
                        firstName,
                        lastName,
                        email,
                        resume,
                        profileImage
                    }
                }
            }
        });

        return NextResponse.json(applications, { status: 200 });

    } catch (err) {
        console.error('Error fetching applications:', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
