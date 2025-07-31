"use client";

import { useEffect, useState } from "react";

export default function ProfileClientComponent() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    phone: "",
    headline: "",
    experience: "",
    education: "",
    skills: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) return;
      const data = await res.json();
      setUser(data);

      // Pre-fill form
      setForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        bio: data.bio || "",
        location: data.location || "",
        phone: data.phone || "",
        headline: data.headline || "",
        experience: data.experience || "",
        education: data.education || "",
        skills: data.skills?.map((s) => s.name).join(", ") || "",
      });

      setLoading(false);
    };

    getUser();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const updated = await res.json();
      setUser(updated);
      alert("Profile updated");
    } else {
      alert("Error updating profile");
    }

    setSaving(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>First Name</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label>Last Name</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label>Headline</label>
          <input
            name="headline"
            value={form.headline}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label>Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label>Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label>Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label>Experience</label>
          <input
            name="experience"
            value={form.experience}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label>Education</label>
          <input
            name="education"
            value={form.education}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label>Skills (comma separated)</label>
          <input
            name="skills"
            value={form.skills}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {saving ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
