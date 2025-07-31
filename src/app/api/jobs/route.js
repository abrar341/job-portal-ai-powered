import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const jobs = await prisma.job.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                postedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                        companyName: true,
                        profileImage: true
                    }
                }
            }
        });

        return NextResponse.json(jobs, { status: 200 });

    } catch (error) {
        console.error('Error fetching jobs:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
