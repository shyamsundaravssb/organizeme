"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
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
    return (
      <div className="text-center p-10 text-text-secondary">
        Loading profile...
      </div>
    );
  }
  if (error) {
    return <div className="text-center p-10 text-error">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      {/* --- REFACTORED: Back Button --- */}
      <Button
        variant="ghost"
        onClick={() => router.push(isLoggedIn ? "/dashboard" : "/")}
        className="mb-6"
      >
        &larr; {isLoggedIn ? "Back to Dashboard" : "Back to Homepage"}
      </Button>

      {/* --- REFACTORED: Header Text --- */}
      <h1 className="text-4xl font-bold text-text-primary mb-2">
        {username}'s Public Playlists
      </h1>
      <p className="text-text-secondary mb-8">
        Browse all public playlists created by this user.
      </p>
      {/* --- REFACTORED: Replaced <div> with <Card> component --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <Card
              as={Link}
              href={`/playlist/${playlist._id}`}
              key={playlist._id}
              className="block p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] h-full"
            >
              <h2 className="text-xl font-semibold mb-2 text-text-primary">
                {playlist.title}
              </h2>
              <p className="text-text-secondary line-clamp-2">
                {playlist.description || "No description"}
              </p>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-text-secondary py-16">
            This user hasn't made any playlists public yet.
          </p>
        )}
      </div>
    </div>
  );
}
