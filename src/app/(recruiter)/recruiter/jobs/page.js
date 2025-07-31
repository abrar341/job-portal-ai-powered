'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import JobCreateModal from '@/components/JobCreateModal';

export default function JobsListPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/login');
            return;
        }

        fetchJobs();
    }, [session, status, router]);

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

    const handleCreateJob = () => {
        setEditingJob(null);
        setIsModalOpen(true);
    };

    const handleEditJob = (job) => {
        setEditingJob(job);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingJob(null);
    };

    const handleModalSuccess = () => {
        // Refresh the jobs list after successful create/update
        fetchJobs();
    };

    const formatSalary = (salaryFrom, salaryTo) => {
        if (!salaryFrom && !salaryTo) return 'Not specified';
        if (!salaryTo) return `$${salaryFrom?.toLocaleString()}+`;
        if (!salaryFrom) return `Up to $${salaryTo?.toLocaleString()}`;
        return `$${salaryFrom?.toLocaleString()} - $${salaryTo?.toLocaleString()}`;
    };

    const formatJobType = (jobType) => {
        const types = {
            FULL_TIME: 'Full Time',
            PART_TIME: 'Part Time',
            CONTRACT: 'Contract',
            INTERNSHIP: 'Internship',
            FREELANCE: 'Freelance',
            REMOTE: 'Remote'
        };
        return types[jobType] || jobType;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">My Posted Jobs</h1>
                        <p className="text-gray-600 mt-2">Manage and track your job postings</p>
                    </div>

                    {jobs.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5M8 8h8m-8 4h8m-8 4h8" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                            <p className="text-gray-500 mb-6">Start by posting your first job to attract qualified candidates.</p>
                            <button
                                onClick={handleCreateJob}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Post Your First Job
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <p className="text-gray-600">
                                    {jobs.length} job{jobs.length !== 1 ? 's' : ''} posted
                                </p>
                                <button
                                    onClick={handleCreateJob}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Post New Job
                                </button>
                            </div>

                            <div className="grid gap-6">
                                {jobs.map((job) => (
                                    <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className='flex justify-between items-center'>
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                        {job.title}
                                                    </h3>
                                                    <button
                                                        className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200  bg-blue-50 rounded-md transition-colors"
                                                        onClick={() => handleEditJob(job)}
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {job.location}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatJobType(job.jobType)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                        </svg>
                                                        {formatSalary(job.salaryFrom, job.salaryTo)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 mb-4 line-clamp-3">
                                                    {job.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                                <span>Posted {formatDate(job.createdAt)}</span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    {job._count?.applications || 0} application{(job._count?.applications || 0) !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div>
                                                <button
                                                    onClick={() => router.push(`/recruiter/applications/manage?jobId=${job.id}`)}
                                                    className="px-4 py-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-200 rounded-md transition-colors"
                                                >
                                                    View Applications
                                                </button>

                                            </div>

                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Job Create/Edit Modal */}
            <JobCreateModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                recruiterId={session?.user?.id}
                editingJob={editingJob}
            />
        </>
    );
}