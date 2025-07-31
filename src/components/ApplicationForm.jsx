"use client";

import { useState } from "react";

export default function ApplicationForm({ jobId, applicantId }) {
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = (useState < File) | (null > null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("coverLetter", coverLetter);
    if (resumeFile) {
      formData.append("resume", resumeFile);
    }
    formData.append("jobId", jobId);
    formData.append("applicantId", applicantId);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to submit application");
      }

      setSuccess("Application submitted successfully!");
      setCoverLetter("");
      setResumeFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Apply for Job</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Cover Letter</label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={5}
            className="w-full border rounded p-2"
            placeholder="Write your cover letter here..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Resume (PDF or DOC)
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>

        {error && <p className="text-red-600 mt-2">{error}</p>}
        {success && <p className="text-green-600 mt-2">{success}</p>}
      </form>
    </div>
  );
}
