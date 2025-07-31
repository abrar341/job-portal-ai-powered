"use client";

import { useEffect, useState } from "react";

export default function ApplicationStatus({ userId, role = "SEEKER" }) {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const endpoint =
      role === "RECRUITER"
        ? `/api/jobs/${userId}/applications`
        : `/api/users/${userId}/applications`;

    fetch(endpoint)
      .then((res) => res.json())
      .then(setApplications);
  }, [userId]);

  if (applications.length === 0) return <p>No applications yet.</p>;

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div key={app.id} className="border p-4 rounded shadow-sm">
          <h4 className="font-semibold">
            {role === "RECRUITER"
              ? `${app.applicant.firstName} ${app.applicant.lastName}`
              : app.job.title}
          </h4>
          <p className="text-sm text-gray-600">
            {app.coverLetter || "No cover letter submitted."}
          </p>
        </div>
      ))}
    </div>
  );
}
