"use client";

import { useState } from "react";
import ProfileEdit from "./ProfileEdit";

export default function ProfileViewer({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = (updatedUser) => {
    setCurrentUser(updatedUser);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <ProfileEdit
        user={currentUser}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              {/* Profile Photo */}
              <div className="text-center mb-6">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                  {currentUser.firstName?.charAt(0) || "U"}
                  {currentUser.lastName?.charAt(0) || "U"}
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                  {currentUser.firstName} {currentUser.lastName}
                </h1>
                <p className="text-blue-600 font-medium">
                  {currentUser.headline || "Professional"}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  {currentUser.bio || "No bio available"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleEditClick}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profile
                </button>
                {/* <button className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center">
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Send Email
                </button> */}
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {currentUser.skills && currentUser.skills.length > 0 ? (
                  currentUser.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {typeof skill === "string" ? skill : skill.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills added yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    FIRST NAME
                  </label>
                  <p className="text-gray-800 font-medium">
                    {currentUser.firstName || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    LAST NAME
                  </label>
                  <p className="text-gray-800 font-medium">
                    {currentUser.lastName || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    PHONE
                  </label>
                  <p className="text-gray-800 font-medium">
                    {currentUser.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    EMAIL
                  </label>
                  <p className="text-gray-800 font-medium">
                    {currentUser.email || "Not provided"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    LOCATION
                  </label>
                  <p className="text-gray-800 font-medium">
                    {currentUser.location || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Experience Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Experience</h2>
                {/* <button className="text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button> */}
              </div>

              {currentUser.experience ? (
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      EX
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        Work Experience
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {currentUser.experience}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No experience added yet</p>
              )}
            </div>

            {/* Education Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Education</h2>
                {/* <button className="text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button> */}
              </div>

              {currentUser.education ? (
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      ED
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        Educational Background
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {currentUser.education}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No education added yet</p>
              )}
            </div>

            {/* Professional Summary */}
            {currentUser.headline && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Professional Summary
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {currentUser.headline}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
