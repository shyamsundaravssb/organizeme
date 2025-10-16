"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Modal from "@/app/components/Modal";
import Button from "@/app/components/ui/Button";

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

  if (isLoading) return <p className="text-center p-8">Loading item...</p>;
  if (error)
    return <p className="text-center p-8 text-error">Error: {error}</p>;
  if (!item) return <p className="text-center p-8">Item not found.</p>;

  return (
    <div className="container mx-auto p-4 sm:p-8">
      {/* --- REFACTORED: Header and Action Buttons --- */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/playlist/${item.parentPlaylist._id}`)}
          className="self-start"
        >
          &larr; Back to Playlist
        </Button>
        {isOwner && (
          <div className="flex gap-2 sm:gap-4">
            <Button variant="secondary" onClick={handleOpenDetailsModal}>
              Edit Details
            </Button>
            <Button variant="primary" onClick={handleOpenNotesModal}>
              Edit Notes
            </Button>
            <Button destructive onClick={() => setIsDeleteModalOpen(true)}>
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* --- REFACTORED: Content Card --- */}
      <div className="bg-surface p-6 sm:p-8 rounded-lg shadow-lg border border-border">
        <h1 className="text-4xl font-bold text-text-primary">{item.title}</h1>
        <p className="text-lg text-text-secondary mt-2 pb-6 border-b border-border">
          {item.description}
        </p>
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">
            Notes
          </h2>
          <div className="prose prose-lg max-w-none text-text-secondary">
            <p>{item.notes || "No notes have been added yet."}</p>
          </div>
        </div>
      </div>

      {/* --- REFACTORED: Modal Forms & Buttons --- */}
      {isOwner && (
        <>
          <Modal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
          >
            <h2 className="text-2xl font-bold mb-4 text-text-primary">
              Edit Details
            </h2>
            <form onSubmit={handleUpdateItem} className="space-y-4">
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
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </Modal>

          <Modal
            isOpen={isNotesModalOpen}
            onClose={() => setIsNotesModalOpen(false)}
            className="w-11/12 max-w-5xl h-[85vh] p-6 flex flex-col"
          >
            <h2 className="text-2xl font-bold mb-4 flex-shrink-0 text-text-primary">
              Edit Notes
            </h2>
            <form
              onSubmit={handleUpdateItem}
              className="flex flex-col flex-grow min-h-0"
            >
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                className="w-full p-3 border border-border rounded-md flex-grow resize-none bg-surface-secondary"
                placeholder="Start writing your notes here..."
              />
              <div className="flex justify-end gap-4 mt-4 flex-shrink-0">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setIsNotesModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Notes
                </Button>
              </div>
            </form>
          </Modal>

          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
          >
            <h2 className="text-2xl font-bold mb-4 text-text-primary">
              Delete Item?
            </h2>
            <p className="text-text-secondary mb-6">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button destructive type="button" onClick={handleDeleteItem}>
                Yes, Delete
              </Button>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
