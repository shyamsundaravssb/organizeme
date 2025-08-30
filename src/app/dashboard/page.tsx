"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";

interface Playlist {
  _id: string;
  title: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<{ name: string; username: string } | null>(
    null
  );
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserDataAndPlaylists = async () => {
      try {
        // Fetch user data from the protected API route
        const userRes = await fetch("/api/protected");

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);

          // Fetch user's playlists
          const playlistsRes = await fetch("/api/playlists");

          if (playlistsRes.ok) {
            const playlistsData = await playlistsRes.json();
            setPlaylists(playlistsData);
          } else {
            const errorData = await playlistsRes.json();
            setPageError(errorData.message || "Failed to fetch playlists.");
          }
        } else {
          const errorData = await userRes.json();
          setPageError(errorData.message || "An error occurred.");
        }
      } catch (error) {
        setPageError("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndPlaylists();
  }, []);

  const handleCreatePlaylist = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!newPlaylistTitle) {
      setError("Playlist title is required.");
      return;
    }

    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newPlaylistTitle }),
      });

      if (response.ok) {
        const newPlaylist = await response.json();
        setPlaylists((prev) => [...prev, newPlaylist]);
        setIsModalOpen(false);
        setNewPlaylistTitle("");
        setError("");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create playlist.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  // New logout function
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        // On successful logout, trigger a redirect to the home/login page
        router.push("/");
      } else {
        console.error("Logout failed.");
      }
    } catch (error) {
      console.error("An error occurred during logout.", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xl font-semibold">
        Loading...
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500 font-semibold text-center p-4">
        {pageError}
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome, {user.name}!
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              This is your personal dashboard.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-4 py-2 text-white font-bold hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="mt-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white font-bold hover:bg-blue-600"
          >
            + New Playlist
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.length > 0 ? (
            playlists.map((playlist) => (
              <div
                key={playlist._id}
                className="rounded-lg bg-white p-6 shadow-md"
              >
                <h2 className="text-xl font-semibold text-gray-800">
                  {playlist.title}
                </h2>
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              You don't have any playlists yet. Click 'New Playlist' to get
              started!
            </p>
          )}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2 className="mb-4 text-2xl font-bold">Create New Playlist</h2>
          <form onSubmit={handleCreatePlaylist}>
            {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
            <div className="mb-4">
              <label
                htmlFor="playlistTitle"
                className="block text-gray-700 font-semibold mb-2"
              >
                Playlist Title
              </label>
              <input
                type="text"
                id="playlistTitle"
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                className="w-full rounded border px-3 py-2"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="mr-2 rounded-lg bg-gray-200 px-4 py-2 font-bold hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-500 px-4 py-2 text-white font-bold hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
