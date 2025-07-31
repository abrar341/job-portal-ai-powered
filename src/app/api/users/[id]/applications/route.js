import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_, { params }) {
    const userId = params.id;

    try {
        const applications = await prisma.application.findMany({
            where: { applicantId: userId },
            include: {
                job: {
                    include: {
                        postedBy: {
                            select: {
                                companyName: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(applications, { status: 200 });

    } catch (err) {
        console.error('Error fetching user applications:', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
