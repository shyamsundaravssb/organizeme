"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Modal from "@/app/components/Modal"; // Adjust path if needed

// Expanded interface to include all playlist fields
interface Playlist {
  _id: string;
  title: string;
  description?: string;
  visibility: "public" | "private";
}

export default function PlaylistPage() {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State for the edit form
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  const params = useParams();
  const playlistId = params.playlistId as string;
  const router = useRouter();

  // 1. Data Fetching for a single playlist
  useEffect(() => {
    if (!playlistId) return;

    const fetchPlaylist = async () => {
      try {
        const response = await fetch(`/api/playlists/${playlistId}`);
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (!response.ok) {
          throw new Error(
            "Playlist not found or you do not have permission to view it."
          );
        }
        const data: Playlist = await response.json();
        setPlaylist(data);
        setEditedTitle(data.title); // Pre-fill edit form state
        setEditedDescription(data.description || "");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylist();
  }, [playlistId, router]);

  // 2. Handler for updating the playlist
  const handleUpdatePlaylist = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editedTitle,
          description: editedDescription,
        }),
      });
      if (!response.ok) throw new Error("Failed to update playlist.");
      const updatedPlaylist: Playlist = await response.json();
      setPlaylist(updatedPlaylist);
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // 3. Handler for toggling visibility
  const handleToggleVisibility = async () => {
    if (!playlist) return;
    const newVisibility =
      playlist.visibility === "private" ? "public" : "private";
    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: newVisibility }),
      });
      if (!response.ok) throw new Error("Failed to update visibility.");
      const updatedPlaylist: Playlist = await response.json();
      setPlaylist(updatedPlaylist);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // 4. Handler for deleting the playlist
  const handleDeletePlaylist = async () => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete playlist.");
      router.push("/dashboard"); // Redirect to dashboard on successful deletion
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (isLoading) return <p>Loading playlist...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!playlist) return <p>Playlist not found.</p>;

  return (
    <div className="container mx-auto p-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{playlist.title}</h1>
        <p className="text-lg text-gray-600 mt-2">{playlist.description}</p>
        <span
          className={`mt-4 inline-block px-3 py-1 text-sm font-semibold rounded-full ${
            playlist.visibility === "public"
              ? "bg-green-200 text-green-800"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {playlist.visibility.charAt(0).toUpperCase() +
            playlist.visibility.slice(1)}
        </span>
      </div>

      {/* Controls Section */}
      <div className="flex gap-4 mb-8 p-4 bg-gray-50 rounded-lg border">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded"
        >
          Edit Details
        </button>
        <button
          onClick={handleToggleVisibility}
          className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded"
        >
          Make {playlist.visibility === "private" ? "Public" : "Private"}
        </button>
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Delete Playlist
        </button>
      </div>

      {/* Content will go here in Phase 3 */}
      <div className="p-4 border-dashed border-2 rounded-lg">
        <p className="text-gray-500">
          Items and Sub-Playlists will be displayed here in the next phase.
        </p>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2 className="text-2xl font-bold mb-4">Edit Playlist</h2>
        <form onSubmit={handleUpdatePlaylist}>
          <div className="mb-4">
            <label
              htmlFor="edit-title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="edit-title"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="edit-description"
              className="block text-sm font-medium text-gray-700"
            >
              Description (Optional)
            </label>
            <textarea
              id="edit-description"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <h2 className="text-2xl font-bold mb-4">Are you sure?</h2>
        <p className="text-gray-700 mb-6">
          This will permanently delete the playlist and all of its contents.
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(false)}
            className="py-2 px-4 bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeletePlaylist}
            className="py-2 px-4 bg-red-500 text-white font-bold rounded-md"
          >
            Yes, Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
