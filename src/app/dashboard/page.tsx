"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Modal from "../components/Modal";

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

      // On successful logout, redirect to the login page
      router.push("/login");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // 3. Conditional Rendering
  if (isLoading) return <p>Loading your dashboard...</p>;
  if (error) return <p>Error: {error}</p>;

  // 4. Main Component Render
  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Playlists</h1>
        {/* Container for the action buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            + New Playlist
          </button>
          {/* The new Logout button */}
          <button
            onClick={handleLogout}
            className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </div>
      {/* Playlist Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <div
              key={playlist._id}
              onClick={() => router.push(`/playlist/${playlist._id}`)}
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{playlist.title}</h2>
              <p className="text-gray-600">
                {playlist.description || "No description"}
              </p>
            </div>
          ))
        ) : (
          <p>
            You haven't created any playlists yet. Click "+ New Playlist" to get
            started!
          </p>
        )}
      </div>

      {/* Use the reusable Modal component */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-2xl font-bold mb-4">Create a New Playlist</h2>
        <form onSubmit={handleCreatePlaylist}>
          {/* Form fields and buttons are the same as before */}
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={newPlaylistTitle}
              onChange={(e) => setNewPlaylistTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={newPlaylistDescription}
              onChange={(e) => setNewPlaylistDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            ></textarea>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="py-2 px-4 bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-blue-500 text-white font-bold rounded-md"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
