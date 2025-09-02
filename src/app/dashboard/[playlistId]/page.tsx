"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Item {
  _id: string;
  title: string;
  url: string;
  notes: string;
}

export default function PlaylistPage() {
  const params = useParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const playlistId = params.playlistId as string;

  useEffect(() => {
    if (!playlistId) {
      setPageError("Playlist ID is missing.");
      setLoading(false);
      return;
    }

    const fetchItems = async () => {
      try {
        // Corrected API endpoint to match the new backend structure
        const response = await fetch(`/api/playlists/${playlistId}/items`);

        if (response.ok) {
          const itemsData = await response.json();
          setItems(itemsData);
        } else {
          const errorData = await response.json();
          setPageError(errorData.message || "Failed to fetch items.");
        }
      } catch (error) {
        setPageError("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [playlistId]);

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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        <Link
          href="/dashboard"
          className="mb-4 inline-block text-blue-500 hover:underline"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-gray-800">
          Playlist: {playlistId}
        </h1>
        <p className="mt-2 text-lg text-gray-600">Items and content go here.</p>
        <div className="mt-8 grid grid-cols-1 gap-4">
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item._id} className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="text-xl font-semibold text-gray-800">
                  {item.title}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  URL:{" "}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {item.url}
                  </a>
                </p>
                {item.notes && (
                  <p className="mt-2 text-gray-700">{item.notes}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              This playlist is empty. Add an item to get started!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
