import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import Playlist from "@/models/Playlist";
import Item from "@/models/Item";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";

// PUT: Update a specific playlist's content
export async function PUT(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  await dbConnect();
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { playlistId } = await params;
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
      { _id: playlistId, owner: user._id }, // Security: Ensures you can only update your own playlists
      { title, description },
      { new: true }
    );

    if (!updatedPlaylist) {
      return NextResponse.json(
        { message: "Playlist not found or permission denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPlaylist, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating playlist", error },
      { status: 500 }
    );
  }
}

// PATCH: Update a specific playlist's visibility
export async function PATCH(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  await dbConnect();
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { playlistId } = await params;
    const { visibility } = await request.json();

    if (!visibility || !["public", "private"].includes(visibility)) {
      return NextResponse.json(
        { message: "Valid visibility status is required" },
        { status: 400 }
      );
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
      { _id: playlistId, owner: user._id }, // Security check
      { visibility },
      { new: true }
    );

    if (!updatedPlaylist) {
      return NextResponse.json(
        { message: "Playlist not found or permission denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPlaylist, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating playlist visibility", error },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific playlist and all its contents
export async function DELETE(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  await dbConnect();
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { playlistId } = await params;

    // 1. Find all sub-playlists of the playlist being deleted
    const subPlaylists = await Playlist.find({
      parent: playlistId,
      owner: user._id,
    });
    const subPlaylistIds = subPlaylists.map((p) => p._id);
    const allPlaylistIdsToDelete = [playlistId, ...subPlaylistIds];

    // 2. Delete all items belonging to the main playlist AND its sub-playlists
    await Item.deleteMany({
      parentPlaylist: { $in: allPlaylistIdsToDelete },
      owner: user._id,
    });

    // 3. Delete the main playlist and all its sub-playlists
    await Playlist.deleteMany({
      _id: { $in: allPlaylistIdsToDelete },
      owner: user._id,
    });

    return NextResponse.json(
      { message: "Playlist and its content deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting playlist", error },
      { status: 500 }
    );
  }
}
