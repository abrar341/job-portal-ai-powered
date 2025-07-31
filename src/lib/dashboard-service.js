// lib/dashboard-service.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class DashboardService {

    async getRecruiterDashboard(recruiterId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        try {
            // Get all data in parallel for better performance
            const [
                totalJobs,
                activeJobs,
                totalApplications,
                newApplications,
                interviewsScheduled,
                hiredCandidates,
                applicationTrends,
                jobTypeDistribution,
                recentApplications,
                topJobs,
                upcomingInterviews
            ] = await Promise.all([
                this.getTotalJobs(recruiterId),
                this.getActiveJobs(recruiterId),
                this.getTotalApplications(recruiterId),
                this.getNewApplications(recruiterId, startDate),
                this.getInterviewsScheduled(recruiterId),
                this.getHiredCandidates(recruiterId),
                this.getApplicationTrends(recruiterId, startDate),
                this.getJobTypeDistribution(recruiterId),
                this.getRecentApplications(recruiterId),
                this.getTopJobs(recruiterId),
                this.getUpcomingInterviews(recruiterId)
            ]);

            // Calculate response rate (applications that moved beyond APPLIED status)
            const reviewedApplications = await prisma.application.count({
                where: {
                    job: { postedById: recruiterId },
                    status: { not: 'APPLIED' }
                }
            });

            const responseRate = totalApplications > 0 ?
                Math.round((reviewedApplications / totalApplications) * 100) : 0;

            // Calculate average time to hire
            const avgTimeToHire = await this.getAverageTimeToHire(recruiterId);

            return {
                stats: {
                    totalJobs,
                    activeJobs,
                    totalApplications,
                    newApplications,
                    interviewsScheduled,
                    hiredCandidates,
                    responseRate,
                    avgTimeToHire
                },
                charts: {
                    applicationTrends,
                    jobTypeDistribution
                },
                lists: {
                    recentApplications,
                    topJobs,
                    upcomingInterviews
                }
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw new Error('Failed to fetch dashboard data');
        }
    }

    async getTotalJobs(recruiterId) {
        return await prisma.job.count({
            where: { postedById: recruiterId }
        });
    }

    async getActiveJobs(recruiterId) {
        return await prisma.job.count({
            where: {
                postedById: recruiterId,
                isActive: true
            }
        });
    }

    async getTotalApplications(recruiterId) {
        return await prisma.application.count({
            where: {
                job: { postedById: recruiterId }
            }
        });
    }

    async getNewApplications(recruiterId, startDate) {
        return await prisma.application.count({
            where: {
                job: { postedById: recruiterId },
                createdAt: { gte: startDate }
            }
        });
    }

    async getInterviewsScheduled(recruiterId) {
        return await prisma.interview.count({
            where: {
                interviewerId: recruiterId,
                status: 'SCHEDULED'
            }
        });
    }

    async getHiredCandidates(recruiterId) {
        return await prisma.hire.count({
            where: {
                application: {
                    job: { postedById: recruiterId }
                }
            }
        });
    }

    async getApplicationTrends(recruiterId, startDate) {
        const applications = await prisma.application.findMany({
            where: {
                job: { postedById: recruiterId },
                createdAt: { gte: startDate }
            },
            select: {
                createdAt: true,
                interviews: {
                    select: { id: true }
                }
            }
        });

        // Initialize trends for each day of the week
        const trends = [
            { name: 'Sun', applications: 0, interviews: 0 },
            { name: 'Mon', applications: 0, interviews: 0 },
            { name: 'Tue', applications: 0, interviews: 0 },
            { name: 'Wed', applications: 0, interviews: 0 },
            { name: 'Thu', applications: 0, interviews: 0 },
            { name: 'Fri', applications: 0, interviews: 0 },
            { name: 'Sat', applications: 0, interviews: 0 }
        ];

        applications.forEach(app => {
            const dayIndex = app.createdAt.getDay();
            trends[dayIndex].applications++;
            trends[dayIndex].interviews += app.interviews.length;
        });

        return trends;
    }

    async getJobTypeDistribution(recruiterId) {
        const jobs = await prisma.job.groupBy({
            by: ['jobType'],
            where: { postedById: recruiterId },
            _count: { jobType: true }
        });

        const total = jobs.reduce((sum, job) => sum + job._count.jobType, 0);

        if (total === 0) return [];

        const colors = {
            FULL_TIME: '#3B82F6',
            PART_TIME: '#10B981',
            CONTRACT: '#F59E0B',
            REMOTE: '#8B5CF6',
            INTERNSHIP: '#EF4444'
        };

        const typeLabels = {
            FULL_TIME: 'Full-time',
            PART_TIME: 'Part-time',
            CONTRACT: 'Contract',
            REMOTE: 'Remote',
            INTERNSHIP: 'Internship'
        };

        return jobs.map(job => ({
            name: typeLabels[job.jobType] || job.jobType,
            value: Math.round((job._count.jobType / total) * 100),
            color: colors[job.jobType] || '#6B7280'
        }));
    }

    async getRecentApplications(recruiterId) {
        const applications = await prisma.application.findMany({
            where: {
                job: { postedById: recruiterId }
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                applicant: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                },
                job: {
                    select: {
                        title: true
                    }
                }
            }
        });

        return applications.map(app => ({
            id: app.id,
            name: `${app.applicant.firstName} ${app.applicant.lastName}`,
            position: app.job.title,
            time: this.getTimeAgo(app.createdAt),
            status: app.status.toLowerCase(),
            avatar: `${app.applicant.firstName[0]}${app.applicant.lastName[0]}`
        }));
    }

    async getTopJobs(recruiterId) {
        const jobs = await prisma.job.findMany({
            where: { postedById: recruiterId },
            include: {
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: {
                applications: {
                    _count: 'desc'
                }
            },
            take: 5
        });

        return jobs.map(job => ({
            id: job.id,
            title: job.title,
            applications: job._count.applications,
            location: job.location,
            type: this.formatJobType(job.jobType)
        }));
    }

    async getUpcomingInterviews(recruiterId) {
        const interviews = await prisma.interview.findMany({
            where: {
                interviewerId: recruiterId,
                status: 'SCHEDULED',
                scheduledAt: {
                    gte: new Date()
                }
            },
            orderBy: { scheduledAt: 'asc' },
            take: 4,
            include: {
                candidate: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                },
                job: {
                    select: {
                        title: true
                    }
                }
            }
        });

        return interviews.map(interview => ({
            id: interview.id,
            candidate: `${interview.candidate.firstName} ${interview.candidate.lastName}`,
            position: interview.job.title,
            time: interview.scheduledAt.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }),
            date: this.formatInterviewDate(interview.scheduledAt)
        }));
    }

    async getAverageTimeToHire(recruiterId) {
        const hires = await prisma.hire.findMany({
            where: {
                application: {
                    job: { postedById: recruiterId }
                }
            },
            include: {
                application: {
                    select: {
                        createdAt: true
                    }
                }
            }
        });

        if (hires.length === 0) return 0;

        const totalDays = hires.reduce((sum, hire) => {
            const daysDiff = Math.ceil(
                (hire.createdAt.getTime() - hire.application.createdAt.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return sum + daysDiff;
        }, 0);

        return Math.round(totalDays / hires.length);
    }

    // Helper methods
    getTimeAgo(date) {
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours === 1) return '1 hour ago';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        if (diffInHours < 48) return '1 day ago';
        return `${Math.floor(diffInHours / 24)} days ago`;
    }

    formatInterviewDate(date) {
        if (this.isToday(date)) return 'Today';
        if (this.isTomorrow(date)) return 'Tomorrow';
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    formatJobType(jobType) {
        const typeMap = {
            FULL_TIME: 'Full-time',
            PART_TIME: 'Part-time',
            CONTRACT: 'Contract',
            REMOTE: 'Remote',
            INTERNSHIP: 'Internship'
        };
        return typeMap[jobType] || jobType;
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    isTomorrow(date) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.toDateString() === tomorrow.toDateString();
    }

    // Method to get previous period data for calculating changes
    async getPreviousPeriodStats(recruiterId, days = 30) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - days);

        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - days);

        const [
            prevJobs,
            prevApplications,
            prevInterviews,
            prevHires
        ] = await Promise.all([
            prisma.job.count({
                where: {
                    postedById: recruiterId,
                    createdAt: { gte: startDate, lt: endDate }
                }
            }),
            prisma.application.count({
                where: {
                    job: { postedById: recruiterId },
                    createdAt: { gte: startDate, lt: endDate }
                }
            }),
            prisma.interview.count({
                where: {
                    interviewerId: recruiterId,
                    createdAt: { gte: startDate, lt: endDate }
                }
            }),
            prisma.hire.count({
                where: {
                    application: {
                        job: { postedById: recruiterId }
                    },
                    createdAt: { gte: startDate, lt: endDate }
                }
            })
        ]);

        return {
            prevJobs,
            prevApplications,
            prevInterviews,
            prevHires
        };
    }

    // Calculate percentage change
    calculateChange(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    }
}

// Export singleton instance
export const dashboardService = new DashboardService();

// Also export the class for testing
export { DashboardService };