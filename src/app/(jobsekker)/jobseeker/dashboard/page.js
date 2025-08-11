'use client'
import { Locate, LocateFixed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const JobSeekerDashboard = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('30');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalApplications: 0,
        interviewsScheduled: 0,
        rejections: 0,
        hired: 0
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [upcomingInterviews, setUpcomingInterviews] = useState([]);
    const [applicationTrends, setApplicationTrends] = useState([]);
    console.log("applicationsResponse", recentApplications);

    const router = useRouter()


    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch all data in parallel
                const [statsResponse, applicationsResponse, interviewsResponse, trendsResponse] = await Promise.all([
                    fetch('/api/job-seeker/dashboard/stats'),
                    fetch('/api/job-seeker/dashboard/applications'),
                    fetch('/api/job-seeker/dashboard/interviews'),
                    fetch('/api/job-seeker/dashboard/trends')
                ]);



                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData);
                }

                if (applicationsResponse.ok) {
                    const applicationsData = await applicationsResponse.json();
                    setRecentApplications(applicationsData);
                }

                if (interviewsResponse.ok) {
                    const interviewsData = await interviewsResponse.json();
                    setUpcomingInterviews(interviewsData);
                }

                if (trendsResponse.ok) {
                    const trendsData = await trendsResponse.json();
                    setApplicationTrends(trendsData);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPLIED': return 'bg-blue-100 text-blue-800';
            case 'REVIEWED': return 'bg-yellow-100 text-yellow-800';
            case 'INTERVIEW_SCHEDULED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'HIRED': return 'bg-purple-100 text-purple-800';
            case 'SHORTLISTED': return 'bg-indigo-100 text-indigo-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'APPLIED': return 'Applied';
            case 'REVIEWED': return 'Reviewed';
            case 'INTERVIEW_SCHEDULED': return 'Interview Scheduled';
            case 'REJECTED': return 'Rejected';
            case 'HIRED': return 'Hired';
            case 'SHORTLISTED': return 'Shortlisted';
            default: return status;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    const StatCard = ({ title, value, icon, color = 'blue', isLoading = false }) => (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">{title}</p>
                    {isLoading ? (
                        <div className="h-8 w-12 bg-gray-200 rounded mt-1 animate-pulse"></div>
                    ) : (
                        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    )}
                </div>
                <div className={`p-3 rounded-lg bg-${color}-100`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    const LoadingCard = () => (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-6xl mx-auto px-4 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                                <p className="text-gray-600 mt-1">Track your job applications</p>
                            </div>
                            <button onClick={() => {
                                router.push('/jobs')
                            }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Find Jobs
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-6">
                    {/* Loading Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <StatCard
                                key={i}
                                title="Loading..."
                                value={0}
                                isLoading={true}
                                icon={<div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>}
                            />
                        ))}
                    </div>

                    {/* Loading Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <LoadingCard />
                        <LoadingCard />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                            <p className="text-gray-600 mt-1">Track your job applications</p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Find Jobs
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Applications"
                        value={stats.totalApplications}
                        color="blue"
                        icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>}
                    />
                    <StatCard
                        title="Hired"
                        value={stats.hired}
                        color="purple"
                        icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>}
                    />
                    <StatCard
                        title="Interviews"
                        value={stats.interviewsScheduled}
                        color="green"
                        icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>}
                    />
                    <StatCard
                        title="Rejections"
                        value={stats.rejections}
                        color="red"
                        icon={<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>}
                    />
                </div>

                {/* Chart */}
                {applicationTrends.length > 0 && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Activity</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={applicationTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="applications" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Applications */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h3>
                        {recentApplications.length > 0 ? (
                            <div className="space-y-3">
                                {recentApplications.map((app) => (
                                    <div key={app.id} className="p-3 rounded-lg border border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900">{app.position}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                                {getStatusText(app.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-600">
                                            <span>{app.company}</span>
                                            <span>{formatDate(app.appliedDate)}</span>
                                        </div>
                                        {app.location && (
                                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg> {app.location}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No applications yet</p>
                                <p className="text-sm">Start applying to see your applications here!</p>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Interviews */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Interviews</h3>
                        {upcomingInterviews.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingInterviews.map((interview) => (
                                    <div key={interview.id} className="p-3 rounded-lg border border-gray-100">
                                        <h4 className="font-medium text-gray-900 mb-1">{interview.position}</h4>
                                        <p className="text-sm text-gray-600 mb-2">{interview.company}</p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-blue-600 font-medium">{interview.date}</span>
                                            <span className="text-gray-500">{interview.time}</span>
                                        </div>
                                        {interview.duration && (
                                            <div className="mt-1 text-xs text-gray-500">
                                                ⏱️ {interview.duration} minutes
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No upcoming interviews</p>
                                <p className="text-sm">Interviews will appear here once scheduled</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobSeekerDashboard;