import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import Playlist from "@/models/Playlist";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser"; // Adjust path if needed

// GET: Fetch all top-level playlists for the authenticated user
export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find playlists where the owner is the current user AND it's a top-level playlist
    const playlists = await Playlist.find({
      owner: user._id,
      parent: null,
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json(playlists, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching playlists", error },
      { status: 500 }
    );
  }
}

// POST: Create a new top-level playlist
export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    const newPlaylist = new Playlist({
      title,
      description,
      owner: user._id,
      // 'parent' will be null by default, creating a top-level playlist
    });

    await newPlaylist.save();
    return NextResponse.json(newPlaylist, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating playlist", error },
      { status: 500 }
    );
  }
}
