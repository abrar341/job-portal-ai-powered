"use client";

import { useState } from "react";

export default function JobCreateForm({ recruiterId, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    jobType: "FULL_TIME",
    salaryFrom: "",
    salaryTo: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Job title is required";
    }

    if (!form.description.trim()) {
      newErrors.description = "Job description is required";
    }

    if (!form.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (
      form.salaryFrom &&
      form.salaryTo &&
      parseInt(form.salaryFrom) > parseInt(form.salaryTo)
    ) {
      newErrors.salaryFrom = "Salary from cannot be greater than salary to";
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salaryFrom: form.salaryFrom ? parseInt(form.salaryFrom) : null,
          salaryTo: form.salaryTo ? parseInt(form.salaryTo) : null,
          postedById: recruiterId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Job posted successfully!");
        setForm({
          title: "",
          description: "",
          location: "",
          jobType: "FULL_TIME",
          salaryFrom: "",
          salaryTo: "",
        });
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error posting job:", error);
      setMessage("Error posting job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 px-2 py-1">
            Post a New Job
          </h1>
          <div className="w-20"></div> {/* Spacer for center alignment */}
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes("successfully")
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Job Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Basic Job Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.title
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="e.g., Senior Software Engineer"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.location
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="e.g., San Francisco, CA"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Job Type
                </label>
                <select
                  name="jobType"
                  value={form.jobType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="FULL_TIME">Full-Time</option>
                  <option value="PART_TIME">Part-Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="REMOTE">Remote</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                    errors.description
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Describe the job role, responsibilities, requirements, and what you're looking for in a candidate..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Salary Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Salary From
                </label>
                <input
                  type="number"
                  name="salaryFrom"
                  value={form.salaryFrom}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.salaryFrom
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="e.g., 80000"
                />
                {errors.salaryFrom && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.salaryFrom}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Salary To
                </label>
                <input
                  type="number"
                  name="salaryTo"
                  value={form.salaryTo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="e.g., 120000"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Leave salary fields empty if you prefer not to disclose
              compensation details.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-8 py-3 rounded-lg text-white font-medium transition-colors ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Posting Job...
                  </span>
                ) : (
                  "Post Job"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
