import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import Playlist from "@/models/Playlist";
import Item from "@/models/Item";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";

// GET: Fetch a single playlist and its contents (handles public/private access)
export async function GET(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  await dbConnect();
  try {
    const { playlistId } = await params;
    const user = await getAuthenticatedUser(); // May be null if user is not logged in

    // 1. Find the playlist first, without checking for ownership yet
    const playlist = await Playlist.findById(playlistId).populate(
      "owner",
      "username"
    ); // <-- UPDATED

    if (!playlist) {
      return NextResponse.json(
        { message: "Playlist not found" },
        { status: 404 }
      );
    }

    // 2. Check for access rights
    const isOwner = user && user._id.equals(playlist.owner._id);
    if (playlist.visibility === "private" && !isOwner) {
      return NextResponse.json(
        { message: "You do not have permission to view this playlist" },
        { status: 404 } // Use 404 to avoid revealing private content exists
      );
    }

    // 3. Fetch contents based on access level
    const items = await Item.find({ parentPlaylist: playlistId });
    let subPlaylists;

    if (isOwner) {
      // The owner sees ALL of their sub-playlists (public and private)
      subPlaylists = await Playlist.find({ parent: playlistId });
    } else {
      // Public viewers ONLY see sub-playlists that are also public
      subPlaylists = await Playlist.find({
        parent: playlistId,
        visibility: "public",
      });
    }

    // 4. Return all data
    return NextResponse.json(
      { playlist, subPlaylists, items },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching playlist content", error },
      { status: 500 }
    );
  }
}

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
