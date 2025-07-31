import CustomVideoPlayer from "@/components/CustomVideoPlayer";
import SearchBar from "@/components/UI/SearchBar";
import YouTubePlayer from "@/components/YouTubePlayer";

// app/(landing)/page.js
export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-12 p-12 md:p-12">
        {/* Left Section - Text */}
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-snug">
            To Choose <span className="text-indigo-600">Right Jobs.</span>
          </h1>
          <p className="text-gray-600">
            2400 Peoples are daily search in this portal, 100 user added job portal!
          </p>

          {/* Search Input */}
          <div className="relative w-full">
            <SearchBar />
          </div>
          {/* Suggest Tags */}
          <div className="mt-4">
            <p className="font-semibold flex items-center gap-2 text-black">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 3h-4.5A1.5 1.5 0 003.75 4.5v4.5a1.5 1.5 0 00.44 1.06l9 9a1.5 1.5 0 002.12 0l4.5-4.5a1.5 1.5 0 000-2.12l-9-9a1.5 1.5 0 00-1.06-.44z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 6.75h.008v.008H6.75V6.75z"
                  />
                </svg>
              </span>
              Suggest Tag :
            </p>

            <div className="mt-2 flex gap-4 text-sm text-gray-700">
              <span>Software</span>
              <span>Marketing</span>
              <span>UI/UX Design</span>
            </div>
          </div>
        </div>

        {/* Right Section - Image placeholder */}
        <div className="flex-1 hidden md:flex justify-center items-center">
          <div className="w-[300px] h-[300px] bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            {/* Placeholder: later you can add image here */}
            <span className="text-xl">[ Image here ]</span>
          </div>
        </div>
      </div>
      <section className="bg-white w-full py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {/* Active Users */}
            <div>
              <div className="text-3xl font-bold text-indigo-600">24,000+</div>
              <p className="mt-2 text-gray-600 text-sm">Active Users</p>
            </div>

            {/* Total Jobs */}
            <div>
              <div className="text-3xl font-bold text-indigo-600">3,500+</div>
              <p className="mt-2 text-gray-600 text-sm">Jobs Posted</p>
            </div>

            {/* Hiring Companies */}
            <div>
              <div className="text-3xl font-bold text-indigo-600">1,200+</div>
              <p className="mt-2 text-gray-600 text-sm">Hiring Companies</p>
            </div>

            {/* Applications Made */}
            <div>
              <div className="text-3xl font-bold text-indigo-600">87,000+</div>
              <p className="mt-2 text-gray-600 text-sm">Applications Submitted</p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-gray-50 w-full py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">Explore Top Categories</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['Software', 'Marketing', 'UI/UX', 'Sales', 'Finance', 'Healthcare'].map((category) => (
              <span
                key={category}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-sm text-gray-700 hover:bg-indigo-100 transition"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="w-full py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Featured Jobs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((job) => (
              <div key={job} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                <h3 className="font-semibold text-lg">Frontend Developer</h3>
                <p className="text-sm text-gray-600 mt-1">Google · Remote</p>
                <p className="mt-2 text-gray-700 text-sm">
                  Build scalable UI features with modern frameworks and tools.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="w-full bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Sign Up', desc: 'Create your free job seeker account.' },
              { title: 'Create Profile', desc: 'Add experience, skills, and preferences.' },
              { title: 'Apply to Jobs', desc: 'One-click apply to thousands of listings.' },
            ].map((step, idx) => (
              <div key={idx} className="bg-white border rounded p-6 shadow-sm">
                <div className="text-indigo-600 text-3xl font-bold mb-4">{idx + 1}</div>
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="w-full bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">What Job Seekers Say</h2>
          <blockquote className="italic text-gray-700">
            “I landed my job in just 3 days. This platform is amazing!”<br />
            <span className="mt-2 block text-sm font-medium text-gray-500">– Sarah, UI Designer</span>
          </blockquote>
        </div>
      </section>
      <section className="w-full bg-indigo-600 py-12 text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Join thousands of job seekers today</h2>
          <p className="mb-6 text-sm">Find the perfect job or the right candidate in minutes.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-indigo-600 px-6 py-2 rounded font-semibold hover:bg-gray-100 transition">
              Sign Up as Job Seeker
            </button>
            <button className="bg-indigo-500 px-6 py-2 rounded font-semibold hover:bg-indigo-700 transition">
              Post a Job
            </button>
          </div>
        </div>
      </section>
      <section className="w-full py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6">Why Choose Us</h2>
          <ul className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
            {[
              '✅ Free for job seekers',
              '✅ Verified companies',
              '✅ Smart search & matching',
            ].map((point, idx) => (
              <li key={idx} className="bg-gray-50 p-4 border rounded">
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <footer className="w-full bg-gray-100 py-6 text-sm text-gray-600 text-center">
        <div className="flex justify-center gap-4 mb-2">
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
        <p>&copy; {new Date().getFullYear()} Job Portal. All rights reserved.</p>
      </footer>

    </div>
  );
}
