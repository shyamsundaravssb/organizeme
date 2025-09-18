import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import User from "@/models/User";
import Playlist from "@/models/Playlist";

// GET: Fetch all public, top-level playlists for a given username
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  await dbConnect();
  try {
    const { username } = await params;

    // 1. Find the user by their username
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { message: `User '${username}' not found.` },
        { status: 404 }
      );
    }

    // 2. Find all playlists that are public, owned by this user, and are top-level
    const playlists = await Playlist.find({
      owner: user._id,
      visibility: "public",
      parent: null,
    }).sort({ createdAt: -1 });

    return NextResponse.json(playlists, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching user's public playlists", error },
      { status: 500 }
    );
  }
}
