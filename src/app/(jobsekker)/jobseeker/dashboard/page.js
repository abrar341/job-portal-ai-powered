'use client'
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const JobSeekerDashboard = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('30');

    // Simple stats
    const stats = {
        totalApplications: 12,
        pendingApplications: 8,
        interviewsScheduled: 3,
        rejections: 4
    };

    const applicationTrends = [
        { name: 'This Week', applications: 3 },
        { name: 'Last Week', applications: 5 },
        { name: '2 Weeks Ago', applications: 2 },
        { name: '3 Weeks Ago', applications: 2 }
    ];

    const recentApplications = [
        { id: 1, company: 'TechCorp', position: 'Frontend Developer', appliedDate: '2 days ago', status: 'APPLIED' },
        { id: 2, company: 'StartupXYZ', position: 'React Developer', appliedDate: '3 days ago', status: 'REVIEWED' },
        { id: 3, company: 'WebSolutions', position: 'Full Stack Developer', appliedDate: '5 days ago', status: 'INTERVIEW_SCHEDULED' },
        { id: 4, company: 'DevCorp', position: 'Software Engineer', appliedDate: '1 week ago', status: 'REJECTED' }
    ];

    const upcomingInterviews = [
        { id: 1, company: 'WebSolutions', position: 'Full Stack Developer', date: 'Tomorrow', time: '10:00 AM' },
        { id: 2, company: 'TechStart', position: 'React Developer', date: 'Friday', time: '2:00 PM' },
        { id: 3, company: 'InnovateCorp', position: 'Frontend Developer', date: 'Next Monday', time: '11:00 AM' }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPLIED': return 'bg-blue-100 text-blue-800';
            case 'REVIEWED': return 'bg-yellow-100 text-yellow-800';
            case 'INTERVIEW_SCHEDULED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'APPLIED': return 'Applied';
            case 'REVIEWED': return 'Reviewed';
            case 'INTERVIEW_SCHEDULED': return 'Interview Scheduled';
            case 'REJECTED': return 'Rejected';
            default: return status;
        }
    };

    const StatCard = ({ title, value, icon, color = 'blue' }) => (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${color}-100`}>
                    {icon}
                </div>
            </div>
        </div>
    );

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
                        title="Pending"
                        value={stats.pendingApplications}
                        color="yellow"
                        icon={<svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                {/* <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
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
                </div> */}

                {/* Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Applications */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h3>
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
                                        <span>{app.appliedDate}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Interviews */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Interviews</h3>
                        <div className="space-y-3">
                            {upcomingInterviews.map((interview) => (
                                <div key={interview.id} className="p-3 rounded-lg border border-gray-100">
                                    <h4 className="font-medium text-gray-900 mb-1">{interview.position}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{interview.company}</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-blue-600 font-medium">{interview.date}</span>
                                        <span className="text-gray-500">{interview.time}</span>
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

export default JobSeekerDashboard;