import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
    const jobId = params.id;
    const { applicantId, resumeUrl, coverLetter } = await request.json();

    try {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return NextResponse.json({ message: 'Job not found' }, { status: 404 });

        // Check if already applied
        const existing = await prisma.application.findFirst({
            where: { jobId, applicantId }
        });
        if (existing) return NextResponse.json({ message: 'Already applied' }, { status: 409 });

        const application = await prisma.application.create({
            data: {
                jobId,
                applicantId,
                resumeUrl,
                coverLetter
            }
        });

        return NextResponse.json({ message: 'Application submitted', application }, { status: 201 });

    } catch (err) {
        console.error('Error applying:', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
