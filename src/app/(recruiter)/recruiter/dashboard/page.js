'use client'
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const RecruiterDashboard = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('30');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Inside your component:
    const router = useRouter();

    const handleViewAll = () => {
        router.push('/recruiter/applications/manage');
    };
    const handleViewInterviews = () => {
        router.push('/recruiter/applications/manage?status=interview_scheduled');
    };


    // State for API data
    const [stats, setStats] = useState({
        totalJobs: 0,
        totalApplications: 0,
        interviewsScheduled: 0,
        hiredCandidates: 0
    });
    const [applicationTrends, setApplicationTrends] = useState([]);
    const [jobTypeDistribution, setJobTypeDistribution] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);
    const [upcomingInterviews, setUpcomingInterviews] = useState([]);

    // Fetch all dashboard data
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all API endpoints simultaneously
            const [
                statsResponse,
                trendsResponse,
                jobTypesResponse,
                applicationsResponse,
                interviewsResponse
            ] = await Promise.all([
                fetch('/api/recruiter/dashboard/stats'),
                fetch('/api/recruiter/dashboard/application-trends'),
                fetch('/api/recruiter/dashboard/job-types'),
                fetch('/api/recruiter/dashboard/recent-applications'),
                fetch('/api/recruiter/dashboard/upcoming-interviews')
            ]);

            // Check for errors
            if (!statsResponse.ok || !trendsResponse.ok || !jobTypesResponse.ok ||
                !applicationsResponse.ok || !interviewsResponse.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            // Parse all responses
            const [
                statsData,
                trendsData,
                jobTypesData,
                applicationsData,
                interviewsData
            ] = await Promise.all([
                statsResponse.json(),
                trendsResponse.json(),
                jobTypesResponse.json(),
                applicationsResponse.json(),
                interviewsResponse.json()
            ]);

            // Update state with fetched data
            setStats(statsData);
            setApplicationTrends(trendsData);
            setJobTypeDistribution(jobTypesData);
            setRecentApplications(applicationsData);
            setUpcomingInterviews(interviewsData);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Refetch when period changes (for future enhancement)
    useEffect(() => {
        // You can implement period-based filtering here if needed
        // fetchDashboardData();
    }, [selectedPeriod]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'reviewed': return 'bg-yellow-100 text-yellow-800';
            case 'interview': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const StatCard = ({ title, value, icon, color = 'blue' }) => (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <div className="text-xl font-bold text-gray-900 mt-1">{value}</div>
                </div>
                <div className={`p-2 rounded-lg bg-${color}-100`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    // Loading component
    const LoadingSkeleton = () => (
        <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
    );

    // Error component
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
                    <div className="text-red-600 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
                            <p className="text-sm text-gray-600 mt-1">Your recruitment overview</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                            </select> */}
                            <button
                                onClick={fetchDashboardData}
                                disabled={loading}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        title="Total Jobs"
                        value={loading ? <LoadingSkeleton /> : stats.totalJobs}
                        color="blue"
                        icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>}
                    />
                    <StatCard
                        title="Applications"
                        value={loading ? <LoadingSkeleton /> : stats.totalApplications}
                        color="green"
                        icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>}
                    />
                    <StatCard
                        title="Interviews"
                        value={loading ? <LoadingSkeleton /> : stats.interviewsScheduled}
                        color="purple"
                        icon={<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>}
                    />
                    <StatCard
                        title="Hired"
                        value={loading ? <LoadingSkeleton /> : stats.hiredCandidates}
                        color="indigo"
                        icon={<svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>}
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Application Trends */}
                    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Applications</h3>
                        {loading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : applicationTrends.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={applicationTrends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="applications" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <p>No application data available</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Job Type Distribution */}
                    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Types</h3>
                        {loading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : jobTypeDistribution.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={jobTypeDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={90}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {jobTypeDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap gap-3 mt-3">
                                    {jobTypeDistribution.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-sm text-gray-600">{item.name} ({item.value}%)</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                    </svg>
                                    <p>No job type data available</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Applications */}
                    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
                            <button
                                className="text-sm cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                                onClick={handleViewAll}
                            >
                                View all
                            </button>
                        </div>
                        <div className="space-y-3">
                            {recentApplications.map((app) => (
                                <div key={app.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                        {app.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{app.name}</p>
                                        <p className="text-sm text-gray-600 truncate">{app.position}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                        {app.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Interviews */}
                    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h3>
                            <button className="text-sm cursor-pointer text-blue-600 hover:text-blue-700 font-medium" onClick={handleViewInterviews}>View all</button>
                        </div>
                        <div className="space-y-3">
                            {upcomingInterviews.map((interview) => (
                                <div key={interview.id} className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900 truncate">{interview.candidate}</h4>
                                        <span className="text-sm text-blue-600 font-medium">{interview.time}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span className="truncate">{interview.position}</span>
                                        <span className="font-medium">{interview.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;
