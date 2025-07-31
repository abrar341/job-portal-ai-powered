'use client'
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const RecruiterDashboard = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('30');

    // Dummy data
    const stats = {
        totalJobs: 24,
        activeJobs: 18,
        totalApplications: 342,
        newApplications: 47,
        interviewsScheduled: 23,
        hiredCandidates: 8,
        responseRate: 78,
        avgTimeToHire: 12
    };

    const applicationTrends = [
        { name: 'Mon', applications: 12, interviews: 3 },
        { name: 'Tue', applications: 19, interviews: 5 },
        { name: 'Wed', applications: 15, interviews: 4 },
        { name: 'Thu', applications: 22, interviews: 7 },
        { name: 'Fri', applications: 28, interviews: 6 },
        { name: 'Sat', applications: 8, interviews: 2 },
        { name: 'Sun', applications: 5, interviews: 1 }
    ];

    const jobTypeDistribution = [
        { name: 'Full-time', value: 65, color: '#3B82F6' },
        { name: 'Part-time', value: 20, color: '#10B981' },
        { name: 'Contract', value: 10, color: '#F59E0B' },
        { name: 'Internship', value: 5, color: '#EF4444' }
    ];

    const recentApplications = [
        { id: 1, name: 'Sarah Johnson', position: 'Senior Developer', time: '2 hours ago', status: 'new', avatar: 'SJ' },
        { id: 2, name: 'Mike Chen', position: 'UX Designer', time: '4 hours ago', status: 'reviewed', avatar: 'MC' },
        { id: 3, name: 'Emma Wilson', position: 'Product Manager', time: '6 hours ago', status: 'interview', avatar: 'EW' },
        { id: 4, name: 'David Brown', position: 'Data Analyst', time: '8 hours ago', status: 'new', avatar: 'DB' },
        { id: 5, name: 'Lisa Garcia', position: 'Frontend Developer', time: '1 day ago', status: 'reviewed', avatar: 'LG' }
    ];

    const topJobs = [
        { id: 1, title: 'Senior React Developer', applications: 45, location: 'San Francisco', type: 'Full-time' },
        { id: 2, title: 'UX/UI Designer', applications: 32, location: 'New York', type: 'Full-time' },
        { id: 3, title: 'Product Manager', applications: 28, location: 'Remote', type: 'Full-time' },
        { id: 4, title: 'Data Scientist', applications: 23, location: 'Boston', type: 'Full-time' },
        { id: 5, title: 'DevOps Engineer', applications: 19, location: 'Seattle', type: 'Contract' }
    ];

    const upcomingInterviews = [
        { id: 1, candidate: 'Alex Rodriguez', position: 'Senior Developer', time: '10:00 AM', date: 'Today' },
        { id: 2, candidate: 'Jennifer Kim', position: 'UX Designer', time: '2:30 PM', date: 'Today' },
        { id: 3, candidate: 'Robert Taylor', position: 'Product Manager', time: '11:00 AM', date: 'Tomorrow' },
        { id: 4, candidate: 'Maria Lopez', position: 'Data Analyst', time: '3:00 PM', date: 'Tomorrow' }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'reviewed': return 'bg-yellow-100 text-yellow-800';
            case 'interview': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const StatCard = ({ title, value, change, icon, color = 'blue' }) => (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {change && (
                        <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change > 0 ? '+' : ''}{change}% from last month
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-lg bg-${color}-100`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-sm text-gray-600 mt-1">Welcome back! Here's your recruitment overview</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                            >
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                            </select>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                                Export Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Jobs"
                        value={stats.totalJobs}
                        change={12}
                        color="blue"
                        icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>}
                    />
                    <StatCard
                        title="Applications"
                        value={stats.totalApplications}
                        change={23}
                        color="green"
                        icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>}
                    />
                    <StatCard
                        title="Interviews"
                        value={stats.interviewsScheduled}
                        change={8}
                        color="purple"
                        icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>}
                    />
                    <StatCard
                        title="Hired"
                        value={stats.hiredCandidates}
                        change={15}
                        color="indigo"
                        icon={<svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>}
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Application Trends */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Trends</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={applicationTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="applications" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="interviews" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Job Type Distribution */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Type Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={jobTypeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {jobTypeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-3 mt-4">
                            {jobTypeDistribution.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm text-gray-600">{item.name} ({item.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Recent Applications */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</button>
                        </div>
                        <div className="space-y-3">
                            {recentApplications.map((app) => (
                                <div key={app.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                        {app.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{app.name}</p>
                                        <p className="text-sm text-gray-600 truncate">{app.position}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">{app.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Jobs */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Top Jobs</h3>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</button>
                        </div>
                        <div className="space-y-3">
                            {topJobs.map((job) => (
                                <div key={job.id} className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900 truncate">{job.title}</h4>
                                        <span className="text-sm font-medium text-blue-600">{job.applications}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span>{job.location}</span>
                                        <span>•</span>
                                        <span>{job.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Interviews */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h3>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</button>
                        </div>
                        <div className="space-y-3">
                            {upcomingInterviews.map((interview) => (
                                <div key={interview.id} className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900 truncate">{interview.candidate}</h4>
                                        <span className="text-sm text-gray-600">{interview.time}</span>
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