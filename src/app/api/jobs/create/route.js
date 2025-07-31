import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();

        const {
            title,
            description,
            location,
            jobType,
            salaryFrom,
            salaryTo,
            postedById
        } = body;

        // Basic validation
        if (!title || !description || !location || !jobType || !postedById) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }
        console.log("postedById", postedById);

        // Make sure the user is a RECRUITER
        const user = await prisma.user.findUnique({
            where: { id: postedById }
        });

        if (!user || user.role !== 'RECRUITER') {
            return NextResponse.json({ message: 'Unauthorized: Not a recruiter' }, { status: 403 });
        }

        // 👇 Convert to integers if they exist
        const parsedSalaryFrom = salaryFrom ? parseInt(salaryFrom, 10) : null;
        const parsedSalaryTo = salaryTo ? parseInt(salaryTo, 10) : null;

        const job = await prisma.job.create({
            data: {
                title,
                description,
                location,
                jobType,
                salaryFrom: parsedSalaryFrom,
                salaryTo: parsedSalaryTo,
                postedById,
            },
        });

        return NextResponse.json({ message: 'Job created', job }, { status: 201 });

    } catch (error) {
        console.error('Error creating job:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
