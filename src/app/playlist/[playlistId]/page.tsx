"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Modal from "@/app/components/Modal";
import Link from "next/link";

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

  // --- NEW STATE FOR ITEM MANAGEMENT ---
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [editedItemTitle, setEditedItemTitle] = useState("");
  const [editedItemDescription, setEditedItemDescription] = useState("");

  // New state for nested content
  const [subPlaylists, setSubPlaylists] = useState<Playlist[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const params = useParams();
  const playlistId = params.playlistId as string;
  const router = useRouter();

  // 1. Updated Data Fetching Logic
  useEffect(() => {
    if (!playlistId) return;
    const fetchPlaylistData = async () => {
      try {
        const response = await fetch(`/api/playlists/${playlistId}`);
        if (!response.ok) throw new Error("Failed to fetch data.");
        const { playlist, subPlaylists, items } = await response.json();
        setPlaylist(playlist);
        setSubPlaylists(subPlaylists);
        setItems(items);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaylistData();
  }, [playlistId]);

  // 2. Handler for creating a new sub-playlist
  // Updated handler to include description
  const handleCreateSubPlaylist = async (e: FormEvent) => {
    e.preventDefault();
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
    }
  };

  // 3. Handler for creating a new item
  const handleCreateItem = async (e: FormEvent) => {
    e.preventDefault();
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
    }
  };

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
    if (!playlist) return; // Add a guard clause

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
      // If there's a parent, go to the parent's page
      router.push(`/playlist/${playlist.parent}`);
    } else {
      // Otherwise, go to the dashboard
      router.push("/dashboard");
    }
  };

  // Opens the edit modal and pre-fills it with the item's data
  const handleOpenItemEditModal = (item: Item) => {
    setItemToEdit(item);
    setEditedItemTitle(item.title);
    setEditedItemDescription(item.description);
  };

  // Submits the update request for an item
  const handleUpdateItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!itemToEdit) return;

    try {
      const response = await fetch(`/api/items/${itemToEdit._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editedItemTitle,
          description: editedItemDescription,
        }),
      });
      if (!response.ok) throw new Error("Failed to update item.");
      const updatedItem = await response.json();

      // Update the item in the local state
      setItems(
        items.map((item) => (item._id === updatedItem._id ? updatedItem : item))
      );
      setItemToEdit(null); // Close the modal
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Submits the delete request for an item
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/items/${itemToDelete._id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete item.");

      // Remove the item from the local state
      setItems(items.filter((item) => item._id !== itemToDelete._id));
      setItemToDelete(null); // Close the modal
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (isLoading) return <p>Loading playlist...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!playlist) return <p>Playlist not found.</p>;

  return (
    <div className="container mx-auto p-8">
      {/* 1. Header Section */}
      <div className="mb-8">
        <button
          onClick={handleBackNavigation}
          className="text-blue-500 hover:underline mb-4 flex items-center"
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
          {playlist.parent ? "Back to Parent Playlist" : "Back to Dashboard"}
        </button>
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

      {/* 2. Main Controls Section */}
      <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 rounded-lg border">
        <button
          onClick={handleOpenEditModal}
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

      {/* 3. "+ Add" Buttons */}
      <div className="my-8 flex flex-wrap gap-4">
        <button
          onClick={() => setIsSubPlaylistModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          + New Sub-Playlist
        </button>
        <button
          onClick={() => setIsItemModalOpen(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          + New Item
        </button>
      </div>

      {/* 4. Sub-Playlists Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">
          Sub-Playlists
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subPlaylists.length > 0 ? (
            subPlaylists.map((sub) => (
              <div
                key={sub._id}
                onClick={() => router.push(`/playlist/${sub._id}`)}
                className="p-4 bg-gray-100 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-lg">{sub.title}</h3>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No sub-playlists yet.</p>
          )}
        </div>
      </div>

      {/* 5. Items Section */}
      <div>
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Items</h2>
        <div className="space-y-4">
          {items.length > 0 ? (
            items.map((item) => (
              <Link href={`/item/${item._id}`} key={item._id} className="block">
                <div className="p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-lg text-gray-800">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500">No items yet.</p>
          )}
        </div>
      </div>

      {/* 6. Modals */}

      {/* Edit Playlist Modal - The form inside is now correctly pre-filled by handleOpenEditModal */}
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            ></textarea>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="py-2 px-4 bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-blue-500 text-white font-bold rounded-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Playlist Confirmation Modal */}
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

      {/* Create Sub-Playlist Modal */}
      <Modal
        isOpen={isSubPlaylistModalOpen}
        onClose={() => setIsSubPlaylistModalOpen(false)}
      >
        <h2 className="text-2xl font-bold mb-4">Create New Sub-Playlist</h2>
        <form onSubmit={handleCreateSubPlaylist}>
          <div className="mb-4">
            <label
              htmlFor="sub-title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="sub-title"
              value={newSubPlaylistTitle}
              onChange={(e) => setNewSubPlaylistTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="sub-description"
              className="block text-sm font-medium text-gray-700"
            >
              Description (Optional)
            </label>
            <textarea
              id="sub-description"
              value={newSubPlaylistDescription}
              onChange={(e) => setNewSubPlaylistDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            ></textarea>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setIsSubPlaylistModalOpen(false)}
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

      {/* Create Item Modal */}
      <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)}>
        <h2 className="text-2xl font-bold mb-4">Create New Item</h2>
        <form onSubmit={handleCreateItem}>
          <div className="mb-4">
            <label
              htmlFor="item-title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="item-title"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="item-description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="item-description"
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            ></textarea>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setIsItemModalOpen(false)}
              className="py-2 px-4 bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-green-500 text-white font-bold rounded-md"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Item Modal */}
      <Modal isOpen={!!itemToEdit} onClose={() => setItemToEdit(null)}>
        <h2 className="text-2xl font-bold mb-4">Edit Item</h2>
        <form onSubmit={handleUpdateItem}>
          <div className="mb-4">
            <label
              htmlFor="edit-item-title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="edit-item-title"
              value={editedItemTitle}
              onChange={(e) => setEditedItemTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="edit-item-description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="edit-item-description"
              value={editedItemDescription}
              onChange={(e) => setEditedItemDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            ></textarea>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setItemToEdit(null)}
              className="py-2 px-4 bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-blue-500 text-white font-bold rounded-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Item Confirmation Modal */}
      <Modal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)}>
        <h2 className="text-2xl font-bold mb-4">Delete Item?</h2>
        <p className="text-gray-700 mb-6">
          Are you sure you want to permanently delete this item? This action
          cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setItemToDelete(null)}
            className="py-2 px-4 bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteItem}
            className="py-2 px-4 bg-red-500 text-white font-bold rounded-md"
          >
            Yes, Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
