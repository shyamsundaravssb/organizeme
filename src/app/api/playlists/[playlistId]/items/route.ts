import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import Playlist from "@/models/Playlist";
import Item from "@/models/Item";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";

// POST: Create a new item within a playlist
export async function POST(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  await dbConnect();
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { playlistId: parentPlaylistId } = await params;
    const { title, description, notes } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required" },
        { status: 400 }
      );
    }

    // Security Check: Verify the parent playlist exists and belongs to the user
    const parentPlaylist = await Playlist.findOne({
      _id: parentPlaylistId,
      owner: user._id,
    });
    if (!parentPlaylist) {
      return NextResponse.json(
        { message: "Playlist not found or permission denied" },
        { status: 404 }
      );
    }

    // Create the new item
    const newItem = new Item({
      title,
      description,
      notes,
      owner: user._id,
      parentPlaylist: parentPlaylistId, // Link item to its parent
    });

    await newItem.save();
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating item", error },
      { status: 500 }
    );
  }
}
