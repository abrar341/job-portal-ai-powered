// GET /api/recruiter/dashboard/application-trends
// - Applications grouped by date(last 7 days)
//     - Join Job -> Application where Job.postedById = currentUser.id

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const recruiterId = session.user.id;

        // Calculate date range for last 7 days
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

        // Applications grouped by date (last 7 days)
        // Join Job -> Application where Job.postedById = currentUser.id
        const applications = await prisma.application.findMany({
            where: {
                job: {
                    postedById: recruiterId
                },
                createdAt: {
                    gte: sevenDaysAgo
                }
            },
            select: {
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Create array for last 7 days with day names
        const last7Days = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            const dayName = dayNames[date.getDay()];
            const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format

            last7Days.push({
                name: dayName,
                date: dateString,
                applications: 0
            });
        }

        // Count applications by date
        applications.forEach(app => {
            const appDate = new Date(app.createdAt).toISOString().split('T')[0];
            const dayData = last7Days.find(day => day.date === appDate);
            if (dayData) {
                dayData.applications++;
            }
        });

        // Transform to match dashboard format (remove date field from response)
        const applicationTrends = last7Days.map(day => ({
            name: day.name,
            applications: day.applications
        }));

        return NextResponse.json(applicationTrends, { status: 200 });

    } catch (error) {
        console.error('Error fetching application trends:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });

    }
}
