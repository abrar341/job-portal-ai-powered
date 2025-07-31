import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;



        const jobs = await prisma.job.findMany({
            where: {
                postedById: userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                _count: {
                    select: {
                        applications: true,
                    },
                },
            },
        });



        return NextResponse.json(jobs, { status: 200 });
    } catch (error) {
        console.error('Error fetching user jobs:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}