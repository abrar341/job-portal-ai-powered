// GET /api/recruiter/dashboard/job-types
// - Count jobs by JobType where postedById = currentUser.id

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

        // Count jobs by JobType where postedById = currentUser.id
        const jobTypeData = await prisma.job.groupBy({
            by: ['jobType'],
            where: {
                postedById: recruiterId
            },
            _count: {
                jobType: true
            }
        });

        // Get total count for percentage calculation
        const totalJobs = jobTypeData.reduce((sum, item) => sum + item._count.jobType, 0);

        // Transform data to match dashboard format
        const jobTypeDistribution = jobTypeData.map(item => {
            let name = '';
            let color = '';

            // Map enum values to display names and colors
            switch (item.jobType) {
                case 'FULL_TIME':
                    name = 'Full-time';
                    color = '#3B82F6';
                    break;
                case 'PART_TIME':
                    name = 'Part-time';
                    color = '#10B981';
                    break;
                case 'CONTRACT':
                    name = 'Contract';
                    color = '#F59E0B';
                    break;
                case 'REMOTE':
                    name = 'Remote';
                    color = '#8B5CF6';
                    break;
                case 'INTERNSHIP':
                    name = 'Internship';
                    color = '#EF4444';
                    break;
                default:
                    name = item.jobType;
                    color = '#6B7280';
            }

            const percentage = totalJobs > 0 ? Math.round((item._count.jobType / totalJobs) * 100) : 0;

            return {
                name,
                value: percentage,
                count: item._count.jobType,
                color
            };
        });

        return NextResponse.json(jobTypeDistribution, { status: 200 });

    } catch (error) {
        console.error('Error fetching job types:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}