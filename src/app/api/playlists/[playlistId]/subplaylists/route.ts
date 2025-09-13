import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import Playlist from "@/models/Playlist";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";

// POST: Create a new sub-playlist within a parent playlist
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

    const { playlistId: parentId } = params;
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    // Security Check: Verify the parent playlist exists and belongs to the user
    const parentPlaylist = await Playlist.findOne({
      _id: parentId,
      owner: user._id,
    });
    if (!parentPlaylist) {
      return NextResponse.json(
        { message: "Parent playlist not found or permission denied" },
        { status: 404 }
      );
    }

    // Create the new playlist, setting its parent field
    const newSubPlaylist = new Playlist({
      title,
      description,
      owner: user._id,
      parent: parentId, // This creates the nested relationship
    });

    await newSubPlaylist.save();
    return NextResponse.json(newSubPlaylist, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating sub-playlist", error },
      { status: 500 }
    );
  }
}
