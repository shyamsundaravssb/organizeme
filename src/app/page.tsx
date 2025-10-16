"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "./components/ui/Button";

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
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center p-8 w-full max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-4">
          Welcome to OrganizeMe
        </h1>
        <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-xl mx-auto">
          Discover and explore public playlists from users around the world.
        </p>

        {/* --- REFINED: Search Bar --- */}
        <form onSubmit={handleSearch} className="w-full max-w-lg mx-auto">
          <div className="relative flex items-center shadow-md rounded-md">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter a username to search..."
              className="w-full pl-5 pr-12 py-3 text-lg bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-text-secondary hover:text-primary transition-colors"
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>

        {/* --- REFINED: Login/Register Buttons --- */}
        <div className="mt-16">
          <p className="text-text-primary mb-4">
            Have an account? Ready to create your own playlists?
          </p>
          <div className="flex justify-center items-center gap-4">
            <Button
              as={Link}
              href="/login"
              variant="secondary"
              className="px-8 py-3"
            >
              Login
            </Button>
            <Button
              as={Link}
              href="/register"
              variant="primary"
              className="px-8 py-3"
            >
              Register
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
