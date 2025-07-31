// components/Navbar.js - Fixed imports and error handling
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  const user = session?.user;

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Job Portal
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link href="/posts" className="text-gray-700 hover:text-blue-600">
              Posts
            </Link>
            <Link href="/jobs" className="text-gray-700 hover:text-blue-600">
              All Jobs
            </Link>
            {user?.role === "RECRUITER" && (
              <Link
                href="/recruiter/dashboard"
                className="text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </Link>
            )}
            {user?.role === "SEEKER" && (
              <Link
                href="/jobseeker/dashboard"
                className="text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex space-x-4 items-center">
            {status === "loading" ? (
              <div className="px-4 py-2 text-gray-500">Loading...</div>
            ) : user ? (
              <>
                <span className="text-gray-700 hidden md:inline">
                  Hi, {user.firstName}
                </span>
                <Link
                  href={
                    user?.role === "RECRUITER"
                      ? "/recruiter/profile"
                      : "/jobseeker/profile"
                  }
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
