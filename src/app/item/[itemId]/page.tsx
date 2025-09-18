"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Modal from "@/app/components/Modal";

interface User {
  _id: string;
}

// Type for our item data
interface Item {
  _id: string;
  title: string;
  description: string;
  notes?: string;
  parentPlaylist: {
    // <-- Updated type from string to object
    _id: string;
  };
  owner: string;
}

export default function ItemDetailPage() {
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form states
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedNotes, setEditedNotes] = useState("");

  const [isOwner, setIsOwner] = useState(false);

  const params = useParams();
  const itemId = params.itemId as string;
  const router = useRouter();

  // Data Fetching
  useEffect(() => {
    if (!itemId) return;
    const fetchAllData = async () => {
      try {
        const [itemRes, meRes] = await Promise.all([
          fetch(`/api/items/${itemId}`),
          fetch("/api/auth/me"),
        ]);

        if (!itemRes.ok) throw new Error("Failed to fetch item data.");

        const itemData: Item = await itemRes.json();
        const { user: currentUser } = await meRes.json();

        setItem(itemData);

        // Check for ownership
        if (currentUser && currentUser._id === itemData.owner) {
          setIsOwner(true);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [itemId]);

  // Handlers
  const handleOpenDetailsModal = () => {
    if (!item) return;
    // Sync all three edit states with the current item data
    setEditedTitle(item.title);
    setEditedDescription(item.description);
    setEditedNotes(item.notes || ""); // Ensure notes are also in sync
    setIsDetailsModalOpen(true);
  };

  const handleOpenNotesModal = () => {
    if (!item) return;
    // Sync all three edit states with the current item data
    setEditedTitle(item.title); // Ensure title is in sync
    setEditedDescription(item.description); // Ensure description is in sync
    setEditedNotes(item.notes || "");
    setIsNotesModalOpen(true);
  };

  const handleUpdateItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!item) return;

    // This body will now always be complete and valid, regardless of which modal was used
    const payload = {
      title: editedTitle,
      description: editedDescription,
      notes: editedNotes,
    };

    try {
      const response = await fetch(`/api/items/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update item.");

      const updatedItem = await response.json();
      setItem(updatedItem);

      setIsDetailsModalOpen(false);
      setIsNotesModalOpen(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteItem = async () => {
    if (!item) return;
    try {
      await fetch(`/api/items/${item._id}`, { method: "DELETE" });
      router.push(`/playlist/${item.parentPlaylist._id}`); // Go back to parent on delete
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (isLoading) return <p>Loading item...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!item) return <p>Item not found.</p>;

  return (
    <div className="container mx-auto p-8">
      {/* Navigation and Actions */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.push(`/playlist/${item.parentPlaylist._id}`)}
          className="text-blue-500 hover:underline flex items-center"
        >
          &larr; Back to Playlist
        </button>
        {/* --- CONDITIONAL RENDER FOR OWNER CONTROLS --- */}
        {isOwner && (
          <div className="flex gap-4">
            <button
              onClick={handleOpenDetailsModal}
              className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded"
            >
              Edit Details
            </button>
            <button
              onClick={handleOpenNotesModal}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Edit Notes
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Item Content Display */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold">{item.title}</h1>
        <p className="text-lg text-gray-600 mt-2 pb-6 border-b">
          {item.description}
        </p>
        <div className="mt-6 prose max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Notes</h2>
          <p>{item.notes || "No notes have been added yet."}</p>
        </div>
      </div>

      {/* Modals */}
      {/* --- CONDITIONAL RENDER FOR MODALS --- */}
      {isOwner && (
        <>
          {/* Edit Details Modal - FIXED */}
          <Modal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
          >
            <h2 className="text-2xl font-bold mb-4">Edit Details</h2>
            <form onSubmit={handleUpdateItem}>
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
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
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

          {/* Notes Editor Modal - FIXED */}
          <Modal
            isOpen={isNotesModalOpen}
            onClose={() => setIsNotesModalOpen(false)}
            // Pass custom classes to make this modal instance wider and taller
            className="w-11/12 max-w-5xl h-[85vh] p-6 flex flex-col"
          >
            <h2 className="text-2xl font-bold mb-4 flex-shrink-0">
              Edit Notes
            </h2>
            <form
              onSubmit={handleUpdateItem}
              className="flex flex-col flex-grow min-h-0"
            >
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                className="w-full p-3 border rounded-md flex-grow resize-none"
                placeholder="Start writing your notes here..."
              />
              <div className="flex justify-end gap-4 mt-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNotesModalOpen(false)}
                  className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-md"
                >
                  Save Notes
                </button>
              </div>
            </form>
          </Modal>

          {/* Delete Confirmation Modal - FIXED */}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
          >
            <h2 className="text-2xl font-bold mb-4">Delete Item?</h2>
            <p className="text-gray-700 mb-6">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteItem}
                className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white font-bold rounded-md"
              >
                Yes, Delete
              </button>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
