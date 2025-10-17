"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";
import Modal from "@/app/components/Modal";
import Link from "next/link";
import Card from "@/app/components/ui/Card";

import Spinner from "@/app/components/ui/Spinner";
import ErrorState from "@/app/components/ui/ErrorState";
import PlaylistPageSkeleton from "@/app/components/ui/PlaylistPageSkeleton";

// Interfaces for our data structures
interface Item {
  _id: string;
  title: string;
  description: string;
}
interface Playlist {
  _id: string;
  title: string;
  description?: string;
  visibility: "public" | "private";
  parent: string | null;
  owner: {
    // <-- UPDATED
    _id: string;
    username: string;
  };
}

export default function PlaylistPage() {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubPlaylistModalOpen, setIsSubPlaylistModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // State for the edit form
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newSubPlaylistTitle, setNewSubPlaylistTitle] = useState("");
  const [newSubPlaylistDescription, setNewSubPlaylistDescription] =
    useState("");

  // New state for nested content
  const [subPlaylists, setSubPlaylists] = useState<Playlist[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  // New state to track if the current viewer is the owner
  const [isOwner, setIsOwner] = useState(false);

  // Loading states for various actions
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const params = useParams();
  const playlistId = params.playlistId as string;
  const router = useRouter();

  // Updated Data Fetching Logic
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch playlist data and current user data concurrently
      const [playlistRes, meRes] = await Promise.all([
        fetch(`/api/playlists/${playlistId}`),
        fetch("/api/auth/me"),
      ]);

      if (!playlistRes.ok) throw new Error("Failed to fetch playlist data.");

      const { playlist, subPlaylists, items } = await playlistRes.json();
      const { user: currentUser } = await meRes.json();

      setPlaylist(playlist);
      setSubPlaylists(subPlaylists);
      setItems(items);

      // Check for ownership
      if (currentUser && currentUser._id === playlist.owner._id) {
        // <-- UPDATED
        setIsOwner(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    if (playlistId) {
      fetchAllData();
    }
  }, [fetchAllData, playlistId]);

  // 2. Handler for creating a new sub-playlist
  // Updated handler to include description
  const handleCreateSubPlaylist = async (e: FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const response = await fetch(
        `/api/playlists/${playlistId}/subplaylists`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newSubPlaylistTitle,
            description: newSubPlaylistDescription, // <-- Pass description to API
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to create sub-playlist.");
      const newSub = await response.json();
      setSubPlaylists([newSub, ...subPlaylists]);
      setIsSubPlaylistModalOpen(false);
      setNewSubPlaylistTitle("");
      setNewSubPlaylistDescription(""); // <-- Reset description state
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  // 3. Handler for creating a new item
  const handleCreateItem = async (e: FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const response = await fetch(`/api/playlists/${playlistId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newItemTitle,
          description: newItemDescription,
        }),
      });
      if (!response.ok) throw new Error("Failed to create item.");
      const newItem = await response.json();
      setItems([newItem, ...items]); // Optimistic update
      setIsItemModalOpen(false);
      setNewItemTitle("");
      setNewItemDescription("");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  // 2. Handler for updating the playlist
  const handleUpdatePlaylist = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
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
    if (!playlist) return; // Add a guard clause
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete playlist.");

      // New conditional redirect logic
      if (playlist.parent) {
        // If there's a parent, go to the parent's page
        router.push(`/playlist/${playlist.parent}`);
      } else {
        // Otherwise, go to the dashboard
        router.push("/dashboard");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      setIsDeleting(false); // Reset on error
    }
  };

  const handleOpenEditModal = () => {
    if (!playlist) return;
    setEditedTitle(playlist.title);
    setEditedDescription(playlist.description || "");
    setIsEditModalOpen(true);
  };

  // New handler for the back button
  const handleBackNavigation = () => {
    if (!playlist) return;

    if (playlist.parent) {
      // Case 1: It's a sub-playlist -> go to its parent
      router.push(`/playlist/${playlist.parent}`);
    } else if (isOwner) {
      // Case 2: It's a top-level playlist AND we are the owner -> go to dashboard
      router.push("/dashboard");
    } else {
      // Case 3: It's a top-level public playlist and we are a visitor -> go to the owner's profile
      router.push(`/profile/${playlist.owner.username}`);
    }
  };

  if (isLoading) return <PlaylistPageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchAllData} />;
  if (!playlist) return <p className="text-center p-8">Playlist not found.</p>;

  return (
    <div className="container mx-auto p-4 sm:p-8">
      {/* --- HEADER --- */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={handleBackNavigation}
          className="mb-4 -ml-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          {playlist.parent
            ? "Back to Parent Playlist"
            : isOwner
            ? "Back to Dashboard"
            : `Back to ${playlist.owner.username}'s Profile`}
        </Button>
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold text-text-primary">
            {playlist.title}
          </h1>
          <span
            className={`mt-1 inline-block px-3 py-1 text-sm font-semibold rounded-full ${
              playlist.visibility === "public"
                ? "bg-success/20 text-success"
                : "bg-surface-secondary text-text-secondary"
            }`}
          >
            {playlist.visibility.charAt(0).toUpperCase() +
              playlist.visibility.slice(1)}
          </span>
        </div>
        <p className="text-lg text-text-secondary mt-2">
          {playlist.description}
        </p>
      </div>

      {/* --- OWNER CONTROLS --- */}
      {isOwner && (
        <>
          {/* --- REFACTORED: Owner controls panel --- */}
          <Card className="flex flex-wrap gap-2 sm:gap-4 mb-8 p-4 bg-surface-secondary">
            <Button variant="secondary" onClick={handleOpenEditModal}>
              Edit Details
            </Button>
            <Button variant="secondary" onClick={handleToggleVisibility}>
              Make {playlist.visibility === "private" ? "Public" : "Private"}
            </Button>
            <Button
              destructive
              onClick={() => setIsDeleteModalOpen(true)}
              className="ml-auto"
            >
              Delete Playlist
            </Button>
          </Card>

          <div className="my-8 flex flex-wrap gap-4">
            {/* ... Add buttons ... */}
          </div>
        </>
      )}

      {/* --- REFACTORED: Sub-Playlists Section --- */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold border-b border-border pb-2 mb-4 text-text-primary">
          Sub-Playlists
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subPlaylists.length > 0 ? (
            subPlaylists.map((sub) => (
              <Card
                key={sub._id}
                onClick={() => router.push(`/playlist/${sub._id}`)}
                className="p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02]"
              >
                <h3 className="font-bold text-lg text-text-primary">
                  {sub.title}
                </h3>
                <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                  {sub.description}
                </p>
              </Card>
            ))
          ) : (
            <p className="text-text-secondary">No sub-playlists yet.</p>
          )}
        </div>
      </div>

      {/* --- REFACTORED: Items Section --- */}
      <div>
        <h2 className="text-2xl font-semibold border-b border-border pb-2 mb-4 text-text-primary">
          Items
        </h2>
        <div className="space-y-4">
          {items.length > 0 ? (
            items.map((item) => (
              <Card
                as={Link}
                href={`/item/${item._id}`}
                key={item._id}
                className="block p-6 cursor-pointer hover:shadow-lg"
              >
                <h3 className="font-bold text-lg text-text-primary">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                  {item.description}
                </p>
              </Card>
            ))
          ) : (
            <p className="text-text-secondary">No items yet.</p>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}
      {isOwner && (
        <>
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          >
            <h2 className="text-2xl font-bold mb-4 text-text-primary">
              Edit Playlist
            </h2>
            <form onSubmit={handleUpdatePlaylist} className="space-y-4">
              <div>
                <label
                  htmlFor="edit-title"
                  className="block text-sm font-semibold text-text-secondary"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="edit-title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="edit-description"
                  className="block text-sm font-semibold text-text-secondary"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="edit-description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSaving}>
                  {isSaving ? <Spinner /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </Modal>

          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
          >
            <h2 className="text-2xl font-bold mb-4 text-text-primary">
              Are you sure?
            </h2>
            <p className="text-text-secondary mb-6">
              This will permanently delete the playlist and all of its contents.
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                destructive
                type="button"
                onClick={handleDeletePlaylist}
                disabled={isDeleting}
              >
                {isDeleting ? <Spinner /> : "Yes, Delete"}
              </Button>
            </div>
          </Modal>

          <Modal
            isOpen={isSubPlaylistModalOpen}
            onClose={() => setIsSubPlaylistModalOpen(false)}
          >
            <h2 className="text-2xl font-bold mb-4 text-text-primary">
              Create New Sub-Playlist
            </h2>
            <form onSubmit={handleCreateSubPlaylist} className="space-y-4">
              <div>
                <label
                  htmlFor="sub-title"
                  className="block text-sm font-semibold text-text-secondary"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="sub-title"
                  value={newSubPlaylistTitle}
                  onChange={(e) => setNewSubPlaylistTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="sub-description"
                  className="block text-sm font-semibold text-text-secondary"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="sub-description"
                  value={newSubPlaylistDescription}
                  onChange={(e) => setNewSubPlaylistDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setIsSubPlaylistModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isCreating}>
                  {isCreating ? <Spinner /> : "Create"}
                </Button>
              </div>
            </form>
          </Modal>

          <Modal
            isOpen={isItemModalOpen}
            onClose={() => setIsItemModalOpen(false)}
          >
            <h2 className="text-2xl font-bold mb-4 text-text-primary">
              Create New Item
            </h2>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label
                  htmlFor="item-title"
                  className="block text-sm font-semibold text-text-secondary"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="item-title"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="item-description"
                  className="block text-sm font-semibold text-text-secondary"
                >
                  Description
                </label>
                <textarea
                  id="item-description"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isCreating}>
                  {isCreating ? <Spinner /> : "Create"}
                </Button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
}
