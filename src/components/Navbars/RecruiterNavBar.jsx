"use client";

import Link from "next/link";

export default function RecruiterNavBar() {
  return (
    <nav className="bg-gray-100 p-4 flex gap-4">
      <Link
        href="/recruiter/dashboard"
        className="text-blue-600 hover:underline"
      >
        Dashboard
      </Link>

      <Link href="/recruiter/jobs" className="text-blue-600 hover:underline">
        Our Jobs
      </Link>
      <Link
        href="/recruiter/applications/manage"
        className="text-blue-600 hover:underline"
      >
        Manage Applications
      </Link>
      {/* <Link
        href="/recruiter/jobs/create"
        className="text-blue-600 hover:underline"
      >
        Post a Job
      </Link> */}
    </nav>
  );
}
