"use client";

import { useState } from "react";

export default function ProfileEdit({ user, onSave, onCancel }) {
  const [form, setForm] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    bio: user.bio || "",
    location: user.location || "",
    phone: user.phone || "",
    headline: user.headline || "",
    experience: user.experience || "",
    education: user.education || "",
    skills:
      user.skills
        ?.map((s) => (typeof s === "string" ? s : s.name))
        .join(", ") || "",
  });
  const [saving, setSaving] = useState(false);
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

    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (form.phone && !/^\+?[\d\s\-\(\)]+$/.test(form.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const updated = await res.json();
        onSave(updated);
      } else {
        const errorData = await res.json();
        alert(
          `Error updating profile: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onCancel}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
          <div className="w-20"></div> {/* Spacer for center alignment */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.firstName
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.lastName
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.phone
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Email cannot be changed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Enter your location"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Professional Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Professional Headline
                </label>
                <input
                  type="text"
                  name="headline"
                  value={form.headline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="e.g., Senior Software Engineer | Full-Stack Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                  placeholder="Tell us about yourself, your passion, and what drives you professionally..."
                />
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Experience</h2>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Work Experience
              </label>
              <textarea
                name="experience"
                value={form.experience}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                placeholder="Describe your work experience, roles, and achievements..."
              />
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Education</h2>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Educational Background
              </label>
              <textarea
                name="education"
                value={form.education}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                placeholder="Describe your educational background, degrees, certifications..."
              />
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Skills</h2>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Technical & Professional Skills
              </label>
              <input
                type="text"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="e.g., JavaScript, React, Node.js, Python, UI/UX Design, Project Management"
              />
              <p className="text-sm text-gray-500 mt-2">
                Separate skills with commas. These will be displayed as tags on
                your profile.
              </p>
            </div>
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
                type="submit"
                disabled={saving}
                className={`px-8 py-3 rounded-lg text-white font-medium transition-colors ${
                  saving
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saving ? (
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
                    Saving Changes...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
