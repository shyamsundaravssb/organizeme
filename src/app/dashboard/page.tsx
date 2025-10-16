"use client";

import Button from "../components/ui/Button";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Card from "../components/ui/Card";
import Modal from "../components/Modal";
import Link from "next/link";

// Define a type for our playlist object for better TypeScript support
interface Playlist {
  _id: string;
  title: string;
  description?: string;
}

export default function DashboardPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const router = useRouter();

  const [searchUsername, setSearchUsername] = useState("");

  // 1. Data Fetching Logic
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch("/api/playlists");
        if (response.status === 401) {
          router.push("/login"); // Redirect if not authorized
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch playlists.");
        }
        const data: Playlist[] = await response.json();
        setPlaylists(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, [router]);

  // 2. Playlist Creation Logic
  const handleCreatePlaylist = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPlaylistTitle) return;

    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPlaylistTitle,
          description: newPlaylistDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create playlist.");
      }

      const newPlaylist: Playlist = await response.json();
      setPlaylists([newPlaylist, ...playlists]); // Add new playlist to the top of the list
      setIsModalOpen(false); // Close modal
      setNewPlaylistTitle(""); // Reset form
      setNewPlaylistDescription("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST", // Or GET, depending on your API route's implementation
      });

      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      // On successful logout, redirect to the home page
      router.push("/");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // --- NEW HANDLER for the search form ---
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchUsername.trim()) {
      router.push(`/profile/${searchUsername.trim()}`);
    }
  };

  // 3. Conditional Rendering
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-text-secondary">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-center p-8 text-error">Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* --- NEW: Global Header --- */}
      {/* --- REFINED: Header Section --- */}
      <header className="bg-surface border-b border-border p-4">
        <div className="container mx-auto flex justify-between items-center gap-4">
          <div className="w-full max-w-lg">
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                placeholder="Find other users..."
                className="w-full px-4 py-2 text-base bg-surface border border-border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:z-10 relative"
              />
              <Button
                type="submit"
                variant="secondary"
                className="rounded-l-none border-l-0" // Join the button to the input
              >
                Search
              </Button>
            </form>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      {/* --- NEW: Main Content Area --- */}
      <main className="container mx-auto p-4 sm:p-8">
        <h1 className="text-3xl font-bold text-text-primary mb-6">
          Your Playlists
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* --- REFACTORED: "Create Playlist" Card --- */}
          <Card
            as="button"
            onClick={() => setIsModalOpen(true)}
            className="flex flex-col items-center justify-center p-6 bg-surface-secondary hover:bg-border border-2 border-dashed border-border transition-colors text-text-secondary hover:text-text-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="font-semibold">New Playlist</span>
          </Card>

          {/* --- REFACTORED: Existing Playlist Cards --- */}
          {playlists.map((playlist) => (
            <Card
              as={Link}
              href={`/playlist/${playlist._id}`}
              key={playlist._id}
              className="p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] h-full"
            >
              <h2 className="text-xl font-semibold mb-2 text-text-primary">
                {playlist.title}
              </h2>
              <p className="text-text-secondary line-clamp-2">
                {playlist.description || "No description"}
              </p>
            </Card>
          ))}
        </div>

        {/* Empty state (only shows if there are no playlists) */}
        {playlists.length === 0 && (
          <div className="text-center py-10 col-span-full">
            <h2 className="text-xl font-semibold text-text-primary">
              Your space is empty
            </h2>
            <p className="text-text-secondary mt-2">
              Get started by creating your first playlist.
            </p>
          </div>
        )}
      </main>
      {/* --- REFACTORED: Modal Form & Buttons --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text-primary">
            Create a New Playlist
          </h2>
          <p className="text-text-secondary">
            Give your new playlist a title and an optional description.
          </p>
        </div>
        <form onSubmit={handleCreatePlaylist} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-text-secondary"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={newPlaylistTitle}
              onChange={(e) => setNewPlaylistTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-text-secondary"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={newPlaylistDescription}
              onChange={(e) => setNewPlaylistDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            ></textarea>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="ghost" // Use 'ghost' for the secondary action
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
