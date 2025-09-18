"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// Define a type for the playlist data we expect
interface Playlist {
  _id: string;
  title: string;
  description?: string;
}

export default function ProfilePage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const username = params.username as string;

  // --- NEW STATE to track login status ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const router = useRouter();

  // Fetch the user's public playlists when the component mounts
  useEffect(() => {
    if (!username) return;

    const fetchAllData = async () => {
      try {
        // Fetch public playlists and the user's session status at the same time
        const [playlistsRes, meRes] = await Promise.all([
          fetch(`/api/users/${username}/playlists`),
          fetch("/api/auth/me"),
        ]);

        if (!playlistsRes.ok) {
          if (playlistsRes.status === 404)
            throw new Error(`User '${username}' not found.`);
          throw new Error("Failed to fetch playlists.");
        }

        const playlistsData: Playlist[] = await playlistsRes.json();
        const { user: currentUser } = await meRes.json();

        setPlaylists(playlistsData);

        // If a user is returned from the 'me' endpoint, they are logged in
        if (currentUser) {
          setIsLoggedIn(true);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [username]);

  if (isLoading) {
    return <div className="text-center p-10">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      {/* --- UPDATED Back Button with conditional logic --- */}
      <button
        onClick={() => router.push(isLoggedIn ? "/dashboard" : "/")}
        className="text-blue-500 hover:underline mb-6"
      >
        &larr; {isLoggedIn ? "Back to Dashboard" : "Back to Homepage"}
      </button>

      <h1 className="text-4xl font-bold mb-2">{username}'s Public Playlists</h1>
      <p className="text-gray-600 mb-8">
        Browse all public playlists created by this user.
      </p>

      {/* Grid of Public Playlists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <Link
              href={`/playlist/${playlist._id}`}
              key={playlist._id}
              className="block"
            >
              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-shadow h-full">
                <h2 className="text-xl font-semibold mb-2">{playlist.title}</h2>
                <p className="text-gray-600">
                  {playlist.description || "No description"}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            This user hasn't made any playlists public yet.
          </p>
        )}
      </div>
    </div>
  );
}
