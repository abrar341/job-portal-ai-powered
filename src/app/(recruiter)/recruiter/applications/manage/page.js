'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RecruiterApplicationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const jobId = searchParams.get('jobId');
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [jobDetails, setJobDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [filter, setFilter] = useState('all');

    const handleDownload = async (resumeUrl, applicantName) => {
        try {
            const response = await fetch(`/api/resume/${resumeUrl.split('/').pop()}`);
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

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/recruiter/jobs');

            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const data = await response.json();
            setJobs(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleJobSelect = (selectedJobId) => {
        if (selectedJobId === 'all') {
            // Remove jobId from URL to show all applications
            router.push('/recruiter/applications/manage');
        } else {
            // Navigate to job-specific applications
            router.push(`/recruiter/applications/manage?jobId=${selectedJobId}`);
        }
    };

    useEffect(() => {
        if (status !== 'authenticated') return;

        const fetchData = async () => {
            try {
                setLoading(true);

                if (jobId) {
                    // Fetch job-specific applications
                    const [applicationsRes, jobsRes] = await Promise.all([
                        fetch(`/api/recruiter/applications?jobId=${jobId}`),
                        fetch('/api/recruiter/jobs')
                    ]);

                    if (!applicationsRes.ok) throw new Error('Failed to fetch applications');
                    if (!jobsRes.ok) throw new Error('Failed to fetch jobs');

                    const [applicationsData, jobsData] = await Promise.all([
                        applicationsRes.json(),
                        jobsRes.json()
                    ]);

                    // Handle response format based on your API
                    if (applicationsData.applications) {
                        setApplications(applicationsData.applications);
                        setJobDetails(applicationsData.job || null);
                    } else {
                        setApplications(applicationsData);
                        // If no job details in response, we'll show job title from applications
                        if (applicationsData.length > 0) {
                            setJobDetails(applicationsData[0].job);
                        }
                    }
                    setJobs(jobsData);
                } else {
                    // Fetch all applications
                    const [applicationsRes, jobsRes] = await Promise.all([
                        fetch('/api/recruiter/applications'),
                        fetch('/api/recruiter/jobs')
                    ]);

                    if (!applicationsRes.ok) throw new Error('Failed to fetch applications');
                    if (!jobsRes.ok) throw new Error('Failed to fetch jobs');

                    const [applicationsData, jobsData] = await Promise.all([
                        applicationsRes.json(),
                        jobsRes.json()
                    ]);

                    setApplications(applicationsData);
                    setJobs(jobsData);
                    setJobDetails(null);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                Applications {jobDetails && `- ${jobDetails.title}`}
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {applications.length} total application{applications.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                                onChange={(e) => handleJobSelect(e.target.value)}
                                value={jobId || 'all'}
                            >
                                <option value="all">All</option>
                                {jobs.map((job) => (
                                    <option key={job.id} value={job.id}>
                                        {job.title} ({job._count.applications} applications)
                                    </option>
                                ))}
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

                {applications.length === 0 && !loading && (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
                        <p className="text-gray-600">Applications will appear here once candidates start applying.</p>
                    </div>
                )}

                {/* Applications Grid */}
                <div className="grid gap-4 lg:gap-6">
                    {applications.map((app) => (
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
                                                    New
                                                </span>
                                            </div>

                                            <div className="text-gray-600 mb-3 space-y-1">
                                                <p className="font-medium text-gray-900 truncate">{app.job?.title}</p>
                                                <p className="text-sm text-gray-600 truncate">{app.applicant?.email}</p>
                                            </div>

                                            {/* Info Tags */}
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="truncate">{app.job?.location}</span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {getTimeAgo(app.createdAt)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                                    </svg>
                                                    {app.job?.jobType?.replace('_', ' ')}
                                                </span>
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
                                        {app.resumeUrl && (
                                            <button
                                                onClick={() => handleDownload(app.resumeUrl, `${app.applicant?.firstName}_${app.applicant?.lastName}`)}
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