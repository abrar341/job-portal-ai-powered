// app/api/dashboard/trends/route.js - Application Trends for Chart
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Get applications from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const applications = await prisma.application.findMany({
            where: {
                applicantId: session.user.id,
                createdAt: {
                    gte: thirtyDaysAgo
                }
            },
            select: {
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Group by week
        const weeklyData = {};
        applications.forEach(app => {
            const weekStart = new Date(app.createdAt);
            const dayOfWeek = weekStart.getDay();
            weekStart.setDate(weekStart.getDate() - dayOfWeek);
            const weekKey = weekStart.toISOString().split('T')[0];

            weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
        });

        // Convert to chart format
        const chartData = Object.entries(weeklyData)
            .map(([date, count]) => ({
                name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                applications: count
            }))
            .slice(-4); // Last 4 weeks

        return NextResponse.json(chartData, { status: 200 });
    } catch (error) {
        console.error('Error fetching application trends:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}