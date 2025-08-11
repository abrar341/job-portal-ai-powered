'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function MyApplicationsPage() {
    const { data: session, status } = useSession();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    console.log("applications", applications);

    useEffect(() => {
        if (status !== 'authenticated') return;

        fetch('/api/applications')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch applications');
                return res.json();
            })
            .then(setApplications)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [status]);

    if (status === 'loading') return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (status === 'unauthenticated') return (
        <div className="max-w-2xl mx-auto p-4 text-center">
            <p className="text-gray-600">You must be logged in to view this page.</p>
        </div>
    );

    const getStatusColor = (status) => {
        const colors = {
            APPLIED: 'bg-blue-100 text-blue-800',
            REVIEWED: 'bg-yellow-100 text-yellow-800',
            SHORTLISTED: 'bg-green-100 text-green-800',
            INTERVIEW_SCHEDULED: 'bg-purple-100 text-purple-800',
            REJECTED: 'bg-red-100 text-red-800',
            HIRED: 'bg-emerald-100 text-emerald-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatSalary = (salaryFrom, salaryTo) => {
        if (!salaryFrom && !salaryTo) return null;
        if (salaryFrom && salaryTo) return `$${salaryFrom.toLocaleString()} - $${salaryTo.toLocaleString()}`;
        if (salaryFrom) return `From $${salaryFrom.toLocaleString()}`;
        if (salaryTo) return `Up to $${salaryTo.toLocaleString()}`;
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const diffInHours = Math.floor((now - new Date(date)) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths}m ago`;
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-white px-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
                <div className="mt-4 text-sm text-gray-500">
                    Total applications: <span className="font-semibold text-gray-900">{applications.length}</span>
                </div>
            </div>

            {/* Loading and Error States */}
            {loading && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading applications...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">Error: {error}</p>
                </div>
            )}

            {/* Empty State */}
            {applications.length === 0 && !loading && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-600">You haven't applied to any jobs yet. Start exploring opportunities!</p>
                </div>
            )}

            {/* Application Cards */}
            <div className="space-y-4">
                {applications.map((app) => (
                    <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            {/* Left side - Job info */}
                            <div className="flex items-start gap-4 flex-1">
                                {/* Company/Job Avatar */}
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                                    {app.job?.title ? app.job.title.charAt(0).toUpperCase() : 'J'}
                                </div>

                                {/* Job Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                                            {app.job?.title || 'Job Deleted'}
                                        </h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                            {app.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-600 mb-2">
                                        Company Name Here {/* You might want to add company name to your schema */}
                                    </div>

                                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                        {app.job?.location && (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>{app.job.location}</span>
                                            </>
                                        )}

                                        {app.job?.location && getTimeAgo(app.createdAt) && <span className="mx-2">•</span>}

                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{getTimeAgo(app.createdAt)}</span>

                                        {app.job?.jobType && (
                                            <>
                                                <span className="mx-2">•</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                                </svg>
                                                <span>{app.job.jobType.replace('_', ' ')}</span>
                                            </>
                                        )}
                                    </div>

                                    {formatSalary(app.job?.salaryFrom, app.job?.salaryTo) && (
                                        <div className="text-sm font-medium text-green-600 mb-3">
                                            💰 {formatSalary(app.job.salaryFrom, app.job.salaryTo)}
                                        </div>
                                    )}

                                    {/* Additional Details */}
                                    <div className="space-y-2">
                                        {app.coverLetter && (
                                            <div className="text-sm">
                                                <span className="font-medium text-gray-700">Cover Letter: </span>
                                                <span className="text-gray-600">
                                                    {app.coverLetter.length > 100
                                                        ? `${app.coverLetter.substring(0, 100)}...`
                                                        : app.coverLetter
                                                    }
                                                </span>
                                            </div>
                                        )}

                                        {/* Interview Status */}
                                        {app.interviews && app.interviews.length > 0 && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4M8 7H4a4 4 0 00-4 4v6a4 4 0 004 4h8a4 4 0 004-4v-6a4 4 0 00-4-4h-4z" />
                                                </svg>
                                                <span className="font-medium text-purple-600">
                                                    {app.interviews.length} Interview{app.interviews.length > 1 ? 's' : ''} Scheduled
                                                </span>
                                            </div>
                                        )}

                                        {/* Hiring Status */}
                                        {app.hire && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946A3.42 3.42 0 017.835 4.697z" />
                                                </svg>

                                                {app.hire && (
                                                    <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-2 rounded-full border border-green-200">
                                                        <span className="text-base">🎉</span>
                                                        <span className="font-semibold">Hired!</span>
                                                        <span className="text-sm">
                                                            Starting {new Date(app.hire.startDate).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                            {app.hire.salary && (
                                                                <> • ${app.hire.salary.toLocaleString()}/year</>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Actions */}
                            {/* <div className="flex flex-col items-end gap-3">
                                {app.resumeUrl && (
                                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Resume
                                    </button>
                                )}

                                <button className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View Details
                                </button>
                            </div> */}
                        </div>

                        {/* Bottom section with timestamps */}
                        {(app.reviewedAt || app.interviews?.length > 0) && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                    {app.reviewedAt && (
                                        <span>Reviewed: {new Date(app.reviewedAt).toLocaleDateString()}</span>
                                    )}
                                    {app.interviews && app.interviews.length > 0 && (
                                        <span>
                                            Next Interview: {new Date(app.interviews[0].scheduledAt).toLocaleDateString()}
                                        </span>
                                    )}
                                    {app.updatedAt !== app.createdAt && (
                                        <span>Updated: {new Date(app.updatedAt).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}