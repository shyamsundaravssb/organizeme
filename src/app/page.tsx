"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      router.push(`/profile/${username.trim()}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 w-full max-w-2xl">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
          Welcome to OrganizeMe
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Discover and explore public playlists from users around the world.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex items-center justify-center w-full"
        >
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter a username to search..."
            className="w-full max-w-md px-4 py-3 text-lg border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-r-md transition-colors"
          >
            Search
          </button>
        </form>

        {/* Login/Register Links */}
        <div className="mt-12">
          <p className="text-gray-700 mb-4">
            Have an account? Ready to create your own playlists?
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-3 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold rounded-md transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
