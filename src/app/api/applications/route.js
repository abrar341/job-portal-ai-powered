import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import formidable from 'formidable';
import { Readable } from 'stream';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import cloudinary from '@/lib/cloudinary';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

// Convert Web Request to Node-compatible stream
async function toNodeRequest(req) {
    const reader = req.body.getReader();
    const stream = new Readable({
        async read() {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                this.push(value);
            }
            this.push(null);
        },
    });

    return Object.assign(stream, {
        headers: Object.fromEntries(req.headers),
        method: req.method,
        url: '',
    });
}

// Parse form using formidable
function parseForm(req) {
    const form = formidable({
        uploadDir: '/tmp', // temporary location
        keepExtensions: true,
    });

    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const nodeReq = await toNodeRequest(req);
        const { fields, files } = await parseForm(nodeReq);

        const { coverLetter, jobId } = fields;
        const applicantId = session.user.id;

        let resumeUrl = null;

        // ⬆ Upload to Cloudinary
        const resume = files.resume?.[0];
        if (resume) {
            const result = await cloudinary.uploader.upload(resume.filepath, {
                folder: 'resumes',
                resource_type: 'raw', // PDF or DOCX or other non-image
            });
            resumeUrl = result.secure_url;

            // Optional: remove temp file
            fs.unlinkSync(resume.filepath);
        }

        const application = await prisma.application.create({
            data: {
                coverLetter: coverLetter?.[0] || '',
                resumeUrl,
                jobId: jobId?.[0],
                applicantId,
            },
        });

        return NextResponse.json(application, { status: 201 });
    } catch (error) {
        console.error('Error submitting application:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const applications = await prisma.application.findMany({
            where: {
                applicantId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                job: {
                    select: {
                        title: true,
                        location: true,
                        jobType: true,
                    },
                },
                hire: {
                    select: {
                        id: true,
                        startDate: true,
                        salary: true,
                        position: true,
                        notes: true,
                        createdAt: true,
                    },
                },
            },
        });

        return NextResponse.json(applications, { status: 200 });
    } catch (error) {
        console.error('Error fetching applications:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}