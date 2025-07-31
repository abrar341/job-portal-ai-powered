'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function MyApplicationsPage() {
    const { data: session, status } = useSession();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    if (status === 'loading') return <p>Checking session...</p>;
    if (status === 'unauthenticated') return <p>You must be logged in to view this page.</p>;

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            <h1 className="text-2xl font-bold">My Applications</h1>

            {loading && <p className="text-gray-600">Loading applications...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {applications.length === 0 && !loading && (
                <p className="text-gray-500">You haven’t applied to any jobs yet.</p>
            )}

            {applications.map((app) => (
                <div key={app.id} className="border p-4 rounded shadow-sm space-y-1">
                    <h3 className="text-lg font-semibold">{app.job?.title || 'Job Deleted'}</h3>
                    <p className="text-sm text-gray-600">
                        {app.job?.location} · {app.job?.jobType?.replace('_', ' ')}
                    </p>
                    <p className="text-sm">
                        <strong>Cover Letter:</strong> {app.coverLetter || 'N/A'}
                    </p>
                    {app.resumeUrl && (
                        <a
                            href={app.resumeUrl}
                            download
                            target="_blank"
                            className="text-blue-600 text-sm underline"
                            rel="noopener noreferrer"
                        >
                            View Resume
                        </a>
                    )}
                    <p className="text-xs text-gray-400">
                        Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                </div>
            ))}
        </div>
    );
}
