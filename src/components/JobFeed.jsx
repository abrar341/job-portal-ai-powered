"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ApplicationModal from "./ApplicationModal"; // Adjust path as needed

export default function JobFeed() {
  const { data: session, status } = useSession(); // session?.user.id = applicantId
  const isLoggedIn =
    status === "authenticated" && session?.user?.role === "SEEKER";

  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false); // For mobile view

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch jobs.");
        return res.json();
      })
      .then((data) => {
        setJobs(data);
        // Auto-select first job if available (only on desktop)
        if (data.length > 0 && window.innerWidth >= 768) {
          setSelectedJob(data[0]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(filter.toLowerCase()) ||
      job.location.toLowerCase().includes(filter.toLowerCase())
  );

  const openModal = (jobId) => {
    setSelectedJobId(jobId);
    setShowModal(true);
  };

  const selectJob = (job) => {
    setSelectedJob(job);
    setShowJobDetails(true); // Show details on mobile
  };

  const backToJobList = () => {
    setShowJobDetails(false);
    setSelectedJob(null);
  };

  const formatSalary = (from, to) => {
    const formatNumber = (num) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num.toString();
    };

    return `$${formatNumber(from)} - $${formatNumber(to)}`;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - new Date(date)) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    const days = Math.floor(diffInHours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  // Mobile Job List Component
  const JobList = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
          Job Listings
        </h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search jobs or location..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Job List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="p-4 md:p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">Error: {error}</p>
            </div>
          </div>
        )}

        {!loading && !error && filteredJobs.length === 0 && (
          <div className="p-4 md:p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-500">Try adjusting your search criteria.</p>
          </div>
        )}

        <div className="divide-y divide-gray-200">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className={`p-4 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedJob?.id === job.id
                  ? "bg-blue-50 md:border-r-4 md:border-l-4 md:border-blue-500"
                  : ""
              }`}
              onClick={() => selectJob(job)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base md:text-lg mb-1 truncate">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {job.postedBy?.firstName} {job.postedBy?.lastName}
                    {job.postedBy?.companyName &&
                      ` • ${job.postedBy.companyName}`}
                  </p>
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                    {job.description || "No description available"}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {getTimeAgo(job.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {job.jobType?.replace("_", " ") || "N/A"}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatSalary(job.salaryFrom, job.salaryTo)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Mobile Job Details Component
  const JobDetails = () => (
    <div className="flex flex-col h-full">
      {/* Header with Back Button */}
      <div className="p-4 md:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4 md:hidden">
          <button
            onClick={backToJobList}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              {selectedJob.title}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {selectedJob.postedBy?.firstName?.charAt(0)?.toUpperCase() ||
                    "C"}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {selectedJob.postedBy?.firstName}{" "}
                  {selectedJob.postedBy?.lastName}
                </p>
                {selectedJob.postedBy?.companyName && (
                  <p className="text-sm text-gray-500">
                    {selectedJob.postedBy.companyName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {selectedJob.location}
              </span>
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                  />
                </svg>
                {selectedJob.jobType?.replace("_", " ") || "N/A"}
              </span>
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                {formatSalary(selectedJob.salaryFrom, selectedJob.salaryTo)}
              </span>
            </div>
          </div>
          {isLoggedIn && (
            <button
              className="w-full sm:w-auto px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm md:text-base"
              onClick={() => openModal(selectedJob.id)}
            >
              Apply Now
            </button>
          )}
        </div>
      </div>

      {/* Job Details Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-6 md:space-y-8">
          {/* Job Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Job Description
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {selectedJob.description ||
                  "No detailed description available for this position."}
              </p>
            </div>
          </div>

          {/* Job Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Job Details
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Job Type</p>
                  <p className="text-sm text-gray-600">
                    {selectedJob.jobType?.replace("_", " ") || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Salary Range</p>
                  <p className="text-sm text-gray-600">
                    {formatSalary(selectedJob.salaryFrom, selectedJob.salaryTo)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6 4h6M8 7h8"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Posted</p>
                  <p className="text-sm text-gray-600">
                    {getTimeAgo(selectedJob.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Apply Section */}
          {isLoggedIn && (
            <div className="bg-blue-50 rounded-lg p-4 md:p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">
                Ready to Apply?
              </h3>
              <p className="text-blue-700 text-sm mb-4">
                Submit your application and get one step closer to your dream
                job.
              </p>
              <button
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                onClick={() => openModal(selectedJob.id)}
              >
                Apply for This Position
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Empty state for desktop when no job is selected
  const EmptyJobDetails = () => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Select a job to view details
        </h3>
        <p className="text-gray-500">
          Choose a job from the list to see more information.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Layout */}
      <div className="md:hidden h-screen flex flex-col">
        {!showJobDetails ? <JobList /> : selectedJob && <JobDetails />}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen">
        {/* Left Sidebar - Job List */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
          <JobList />
        </div>

        {/* Right Panel - Job Details */}
        <div className="w-1/2 bg-white flex flex-col">
          {selectedJob ? <JobDetails /> : <EmptyJobDetails />}
        </div>
      </div>

      {/* Application Modal */}
      {isLoggedIn && session?.user?.id && (
        <ApplicationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          jobId={selectedJobId}
          applicantId={session.user.id}
        />
      )}
    </div>
  );
}
