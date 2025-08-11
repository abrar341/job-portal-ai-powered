'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RecruiterApplicationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Add these new state variables after your existing useState declarations
    const [statusFilter, setStatusFilter] = useState('all');
    const [statusCounts, setStatusCounts] = useState({});
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 1
    });
    const jobId = searchParams.get('jobId');
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [jobDetails, setJobDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [filter, setFilter] = useState('all');

    // New states for API operations
    const [actionLoading, setActionLoading] = useState({});
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [selectedApplicationForInterview, setSelectedApplicationForInterview] = useState(null);
    const [showHireModal, setShowHireModal] = useState(false);
    const [selectedApplicationForHire, setSelectedApplicationForHire] = useState(null);

    // Helper function to show loading state for specific actions
    const setActionLoadingState = (applicationId, action, isLoading) => {
        setActionLoading(prev => ({
            ...prev,
            [`${applicationId}_${action}`]: isLoading
        }));
    };

    // Helper function to show success/error messages
    const showMessage = (message, type = 'success') => {
        setError(type === 'error' ? message : '');
        if (type === 'success') {
            // You could implement a success toast here
            console.log('Success:', message);
        }
    };

    // API Functions

    // 1. Update Application Status
    const updateApplicationStatus = async (applicationId, status) => {
        setActionLoadingState(applicationId, 'status', true);
        try {
            const response = await fetch(`/api/recruiter/applications/${applicationId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error('Failed to update application status');
            }

            const { application } = await response.json();

            // Update local state
            setApplications(prev => prev.map(app =>
                app.id === applicationId ? { ...app, status: application.status } : app
            ));

            showMessage(`Application ${status.toLowerCase()} successfully`);
        } catch (error) {
            console.error('Error updating status:', error);
            showMessage('Failed to update application status', 'error');
        } finally {
            setActionLoadingState(applicationId, 'status', false);
        }
    };

    // 2. Schedule Interview
    const scheduleInterview = async (applicationId, scheduledAt, duration = 60, notes = '') => {
        setActionLoadingState(applicationId, 'interview', true);
        try {
            const response = await fetch('/api/recruiter/interviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    applicationId,
                    scheduledAt,
                    duration,
                    notes
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to schedule interview');
            }

            const { interview } = await response.json();

            // Update local state - application status should be updated to INTERVIEW_SCHEDULED
            setApplications(prev => prev.map(app =>
                app.id === applicationId ? { ...app, status: 'INTERVIEW_SCHEDULED' } : app
            ));

            showMessage('Interview scheduled successfully');
            setShowInterviewModal(false);
            setSelectedApplicationForInterview(null);
        } catch (error) {
            console.error('Error scheduling interview:', error);
            showMessage(error.message, 'error');
        } finally {
            setActionLoadingState(applicationId, 'interview', false);
        }
    };

    // 3. Hire Candidate
    const hireCandidate = async (applicationId, startDate, salary, position, notes = '') => {
        setActionLoadingState(applicationId, 'hire', true);
        try {
            const response = await fetch('/api/recruiter/hire', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    applicationId,
                    startDate,
                    salary: salary ? parseInt(salary) : null,
                    position,
                    notes
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to hire candidate');
            }

            const { hire } = await response.json();

            // Update local state - application status should be updated to HIRED
            setApplications(prev => prev.map(app =>
                app.id === applicationId ? { ...app, status: 'HIRED' } : app
            ));

            showMessage('Candidate hired successfully');
            setShowHireModal(false);
            setSelectedApplicationForHire(null);
        } catch (error) {
            console.error('Error hiring candidate:', error);
            showMessage(error.message, 'error');
        } finally {
            setActionLoadingState(applicationId, 'hire', false);
        }
    };

    // Button Handler Functions
    const handleAccept = async (applicationId) => {
        await updateApplicationStatus(applicationId, 'SHORTLISTED');
    };

    const handleDecline = async (applicationId) => {
        if (confirm('Are you sure you want to decline this application?')) {
            await updateApplicationStatus(applicationId, 'REJECTED');
        }
    };

    const handleScheduleInterview = (application) => {
        setSelectedApplicationForInterview(application);
        setShowInterviewModal(true);
    };

    const handleHire = (application) => {
        setSelectedApplicationForHire(application);
        setShowHireModal(true);
    };

    // Get status badge color
    const getStatusBadge = (status) => {
        const statusColors = {
            'APPLIED': 'bg-blue-100 text-blue-800',
            'REVIEWED': 'bg-yellow-100 text-yellow-800',
            'SHORTLISTED': 'bg-green-100 text-green-800',
            'INTERVIEW_SCHEDULED': 'bg-purple-100 text-purple-800',
            'REJECTED': 'bg-red-100 text-red-800',
            'HIRED': 'bg-emerald-100 text-emerald-800'
        };

        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    // Existing functions (unchanged)
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
            showMessage('Failed to download resume', 'error');
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
            router.push('/recruiter/applications/manage');
            setStatusFilter('all');

        } else {
            router.push(`/recruiter/applications/manage?jobId=${selectedJobId}`);
            setStatusFilter('all');
        }
    };
    // Replace your existing fetchData function inside useEffect with this updated version
    const fetchData = async () => {
        try {
            setLoading(true);

            // Build query parameters
            const params = new URLSearchParams();
            if (jobId) params.append('jobId', jobId);
            if (statusFilter !== 'all') params.append('status', statusFilter.toUpperCase());
            params.append('page', pagination.currentPage.toString());
            params.append('limit', '10');

            const [applicationsRes, jobsRes] = await Promise.all([
                fetch(`/api/recruiter/applications?${params}`),
                fetch('/api/recruiter/jobs')
            ]);

            if (!applicationsRes.ok) throw new Error('Failed to fetch applications');
            if (!jobsRes.ok) throw new Error('Failed to fetch jobs');

            const [applicationsData, jobsData] = await Promise.all([
                applicationsRes.json(),
                jobsRes.json()
            ]);

            // Handle new API response format
            if (applicationsData.applications) {
                // New API format with pagination and filtering
                setApplications(applicationsData.applications);
                setPagination(applicationsData.pagination);
                setStatusCounts(applicationsData.statusCounts);
                if (applicationsData.job) {
                    setJobDetails(applicationsData.job);
                }
            } else {
                // Fallback for old API format
                setApplications(applicationsData);
                if (applicationsData.length > 0) {
                    setJobDetails(applicationsData[0].job);
                }
            }
            setJobs(jobsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    // Update your useEffect dependencies to include statusFilter and pagination.currentPage
    useEffect(() => {
        if (status !== 'authenticated') return;
        fetchData();
    }, [status, jobId, statusFilter, pagination.currentPage]);
    // Add this new function to handle status filter changes
    // / Replace your existing handleStatusFilter function with this updated version
    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page

        // Update URL parameters
        const params = new URLSearchParams(searchParams);

        if (status === 'all') {
            params.delete('status');
        } else {
            params.set('status', status);
        }

        // Keep existing jobId parameter if it exists
        if (jobId) {
            params.set('jobId', jobId);
        }

        // Update the URL without page reload
        router.push(`/recruiter/applications/manage?${params.toString()}`);
    };

    // Add this after your existing useState declarations to sync with URL params
    useEffect(() => {
        const statusParam = searchParams.get('status');
        if (statusParam && statusParam !== statusFilter) {
            setStatusFilter(statusParam);
        }
    }, [searchParams]);

    // Add this new function to handle pagination
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };
    if (status === 'loading' || loading) return (
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

            {/* Status Filter Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'all', label: `All (${statusCounts.all || 0})`, color: 'bg-gray-100 text-gray-800 border-gray-200' },
                        { key: 'shortlisted', label: `Shortlisted (${statusCounts.shortlisted || 0})`, color: 'bg-green-100 text-green-800 border-green-200' },
                        { key: 'interview_scheduled', label: `Interviews (${statusCounts.interview_scheduled || 0})`, color: 'bg-purple-100 text-purple-800 border-purple-200' },
                        { key: 'hired', label: `Hired (${statusCounts.hired || 0})`, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                        { key: 'rejected', label: `Rejected (${statusCounts.rejected || 0})`, color: 'bg-red-100 text-red-800 border-red-200' }
                    ].map((filterOption) => (
                        <button
                            key={filterOption.key}
                            onClick={() => handleStatusFilter(filterOption.key)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 hover:shadow-sm ${statusFilter === filterOption.key
                                ? `${filterOption.color} shadow-sm ring-2 ring-blue-200`
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {filterOption.label}
                        </button>
                    ))}
                </div>
            </div>
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
                                <option value="all">All Jobs</option>
                                {jobs.map((job) => (
                                    <option key={job.id} value={job.id}>
                                        {job.title} ({job._count?.applications || 0} applications)
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
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${getStatusBadge(app.status || 'APPLIED')}`}>
                                                    {app.status?.replace('_', ' ') || 'Applied'}
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
                                    {/* Accept Button */}
                                    <button
                                        onClick={() => handleAccept(app.id)}
                                        disabled={actionLoading[`${app.id}_status`] || app.status === 'SHORTLISTED' || app.status === 'HIRED'}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {actionLoading[`${app.id}_status`] ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                        Accept
                                    </button>

                                    {/* Schedule Interview Button */}
                                    <button
                                        onClick={() => handleScheduleInterview(app)}
                                        disabled={actionLoading[`${app.id}_interview`] || app.status === 'REJECTED' || app.status === 'HIRED'}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-lg hover:from-blue-200 hover:to-indigo-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {actionLoading[`${app.id}_interview`] ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                        <span className="hidden sm:inline">Schedule</span>
                                        <span className="sm:hidden">Interview</span>
                                    </button>

                                    {/* Hire Button (appears for shortlisted or interview_scheduled) */}
                                    {(app.status === 'SHORTLISTED' || app.status === 'INTERVIEW_SCHEDULED') && (
                                        <button
                                            onClick={() => handleHire(app)}
                                            disabled={actionLoading[`${app.id}_hire`]}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 rounded-lg hover:from-emerald-200 hover:to-green-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            {actionLoading[`${app.id}_hire`] ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                </svg>
                                            )}
                                            Hire
                                        </button>
                                    )}

                                    {/* Decline Button */}
                                    <button
                                        onClick={() => handleDecline(app.id)}
                                        disabled={actionLoading[`${app.id}_status`] || app.status === 'REJECTED' || app.status === 'HIRED'}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-100 to-pink-100 text-red-800 rounded-lg hover:from-red-200 hover:to-pink-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {actionLoading[`${app.id}_status`] ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                        Decline
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Interview Scheduling Modal */}
                {showInterviewModal && selectedApplicationForInterview && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Schedule Interview
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Interview with {selectedApplicationForInterview.applicant?.firstName} {selectedApplicationForInterview.applicant?.lastName}
                            </p>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const scheduledAt = formData.get('scheduledAt');
                                const duration = formData.get('duration') || 60;
                                const notes = formData.get('notes') || '';

                                scheduleInterview(selectedApplicationForInterview.id, scheduledAt, parseInt(duration), notes);
                            }}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="scheduledAt"
                                            required
                                            min={new Date().toISOString().slice(0, 16)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Duration (minutes)
                                        </label>
                                        <select
                                            name="duration"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option defaultValue={'30'} value="30">30 minutes</option>
                                            <option value="60">60 minutes</option>
                                            <option value="90">90 minutes</option>
                                            <option value="120">120 minutes</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes (optional)
                                        </label>
                                        <textarea
                                            name="notes"
                                            rows="3"
                                            placeholder="Interview type, preparation notes, etc..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowInterviewModal(false);
                                            setSelectedApplicationForInterview(null);
                                        }}
                                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading[`${selectedApplicationForInterview.id}_interview`]}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {actionLoading[`${selectedApplicationForInterview.id}_interview`] ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : null}
                                        Schedule
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Hire Modal */}
                {showHireModal && selectedApplicationForHire && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Hire Candidate
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Hiring {selectedApplicationForHire.applicant?.firstName} {selectedApplicationForHire.applicant?.lastName} for {selectedApplicationForHire.job?.title}
                            </p>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const startDate = formData.get('startDate');
                                const salary = formData.get('salary');
                                const position = formData.get('position');
                                const notes = formData.get('notes') || '';

                                hireCandidate(selectedApplicationForHire.id, startDate, salary, position, notes);
                            }}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Position Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="position"
                                            required
                                            defaultValue={selectedApplicationForHire.job?.title}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Annual Salary (optional)
                                        </label>
                                        <input
                                            type="number"
                                            name="salary"
                                            placeholder="e.g. 75000"
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes (optional)
                                        </label>
                                        <textarea
                                            name="notes"
                                            rows="3"
                                            placeholder="Additional hiring details..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowHireModal(false);
                                            setSelectedApplicationForHire(null);
                                        }}
                                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading[`${selectedApplicationForHire.id}_hire`]}
                                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {actionLoading[`${selectedApplicationForHire.id}_hire`] ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : null}
                                        Hire Candidate
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            {pagination.totalPages > 1 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 mt-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
                            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} applications
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={!pagination.hasPrevPage}
                                className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-2 text-sm rounded-lg ${pageNum === pagination.currentPage
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={!pagination.hasNextPage}
                                className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                Next
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}