import Link from "next/link";

export default function JobSeekerNavBar() {
  return (
    <nav className="bg-gray-100 p-4 flex gap-4">
      <Link
        href="/jobseeker/applications"
        className="text-blue-600 hover:underline"
      >
        My Applications
      </Link>
      <Link href="/jobseeker/profile" className="text-blue-600 hover:underline">
        Profile
      </Link>
    </nav>
  );
}
