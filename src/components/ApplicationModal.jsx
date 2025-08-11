"use client";

import { useState } from "react";

export default function ApplicationModal({
  isOpen,
  onClose,
  jobId,
  applicantId,
}) {
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("coverLetter", coverLetter);
    formData.append("resume", resume);
    formData.append("jobId", jobId);
    formData.append("applicantId", applicantId);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to apply");

      setSuccess("Application submitted!");
      setCoverLetter("");
      setResume(null);
      onClose(); // Close modal
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-lg space-y-4 w-full max-w-md"
      >
        <h2 className="text-xl font-semibold">Apply for Job</h2>
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Cover letter"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
        />
        {/* <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setResume(e.target.files?.[0] || null)}
        /> */}
        <div className="flex justify-between">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {submitting ? "Applying..." : "Apply"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:underline"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </form>
    </div>
  );
}
