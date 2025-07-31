'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation'; // Changed import
import { useEffect, useState } from 'react';

export default function JobApplicationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams(); // Use useParams instead of router.query
    const jobId = params.jobId; // Get jobId from params

    const [applications, setApplications] = useState([]);
    const [jobDetails, setJobDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [filter, setFilter] = useState('all');

    const handleDownload = async (resumeUrl, applicantName) => {
        try {
            // Handle resume download based on your file structure
            const response = await fetch(resumeUrl);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resume_${applicantName || 'unknown'}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download resume');
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const diffInHours = Math.floor((now - new Date(date)) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 48) return 'Yesterday';
        return `${Math.floor(diffInHours / 24)}d ago`;
    };

    useEffect(() => {
        if (status !== 'authenticated' || !jobId) return;

        // Fetch job-specific applications
        fetch(`/api/recruiter/applications?jobId=${jobId}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch applications');
                return res.json();
            })
            .then((data) => {
                // Handle response format based on your API
                if (data.applications) {
                    setApplications(data.applications);
                    setJobDetails(data.job || null);
                } else {
                    setApplications(data);
                    // If no job details in response, we'll show job title from applications
                    if (data.length > 0) {
                        setJobDetails(data[0].job);
                    }
                }
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [status, jobId]);

    if (status === 'loading') return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (status === 'unauthenticated') return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized</h2>
                <p className="text-gray-600">Please log in to access this page</p>
            </div>
        </div>
    );

    // Filter applications based on selected filter
    const filteredApplications = applications.filter(app => {
        if (filter === 'all') return true;
        if (filter === 'new') return app.status === 'new' || !app.status;
        if (filter === 'reviewed') return app.status === 'reviewed';
        return true;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <button
                                    onClick={() => router.back()}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {jobDetails?.title || 'Job'} Applications
                                </h1>
                            </div>
                            <p className="text-sm text-gray-600 ml-11">
                                {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
                                {jobDetails?.location && ` • ${jobDetails.location}`}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Applications</option>
                                <option value="new">New</option>
                                <option value="reviewed">Reviewed</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 shadow-sm">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {filteredApplications.length === 0 && !loading && (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
                        <p className="text-gray-600">No applications found for this job posting.</p>
                    </div>
                )}

                {/* Applications Grid */}
                <div className="grid gap-4 lg:gap-6">
                    {filteredApplications.map((app) => (
                        <div key={app.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-blue-200 overflow-hidden">
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    {/* Main Content */}
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                            <span className="text-white font-semibold text-lg">
                                                {app.applicant?.firstName?.charAt(0)?.toUpperCase() || 'A'}
                                            </span>
                                        </div>

                                        {/* Application Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                                <h3 className="font-semibold text-gray-900 text-lg truncate">
                                                    {app.applicant?.firstName} {app.applicant?.lastName}
                                                </h3>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 w-fit">
                                                    {app.status || 'New'}
                                                </span>
                                            </div>

                                            <div className="text-gray-600 mb-3 space-y-1">
                                                <p className="text-sm text-gray-600 truncate">{app.applicant?.email}</p>
                                                {app.applicant?.location && (
                                                    <p className="text-sm text-gray-600 truncate">{app.applicant?.location}</p>
                                                )}
                                            </div>

                                            {/* Info Tags */}
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {getTimeAgo(app.createdAt)}
                                                </span>
                                                {app.applicant?.experience && (
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                                        </svg>
                                                        {app.applicant.experience} years exp.
                                                    </span>
                                                )}
                                                {app.applicant?.skills && (
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                        </svg>
                                                        {app.applicant.skills?.slice(0, 2).join(', ')}
                                                        {app.applicant.skills?.length > 2 && ` +${app.applicant.skills.length - 2}`}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Cover Letter Preview */}
                                            {app.coverLetter && (
                                                <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100">
                                                    <p className="text-sm text-gray-700 line-clamp-3">
                                                        {app.coverLetter}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons - Right Side */}
                                    <div className="flex lg:flex-col gap-2 lg:ml-4">
                                        {app.applicant?.resume && (
                                            <button
                                                onClick={() => handleDownload(app.applicant.resume, `${app.applicant?.firstName}_${app.applicant?.lastName}`)}
                                                className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-300 min-w-[100px]"
                                            >
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="hidden sm:inline">Resume</span>
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setSelectedApp(selectedApp === app.id ? null : app.id)}
                                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors border border-gray-200 hover:border-indigo-300 min-w-[100px]"
                                        >
                                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            <span className="hidden sm:inline">View</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Main Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-100">
                                    <button className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Accept
                                    </button>
                                    <button className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-lg hover:from-blue-200 hover:to-indigo-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="hidden sm:inline">Schedule</span>
                                        <span className="sm:hidden">Interview</span>
                                    </button>
                                    <button className="flex-1 px-4 py-3 bg-gradient-to-r from-red-100 to-pink-100 text-red-800 rounded-lg hover:from-red-200 hover:to-pink-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Decline
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}