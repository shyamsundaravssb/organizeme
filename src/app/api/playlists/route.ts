import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/db/dbConnect";
import User from "@/models/User";
import Playlist from "@/models/Playlist";
import { cookies } from "next/headers";

// Corrected Helper function to get the user from the token from a cookie
const getAuthenticatedUser = async () => {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.userId);
    return user || null;
  } catch (error) {
    return null;
  }
};

// GET: Fetch all playlists for the authenticated user
export async function GET() {
  await dbConnect();
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const playlists = await Playlist.find({ owner: user._id }).sort({
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

// POST: Create a new playlist
export async function POST(request: Request) {
  await dbConnect();
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { title } = await request.json();
    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }
    const newPlaylist = new Playlist({ title, owner: user._id });
    await newPlaylist.save();
    return NextResponse.json(newPlaylist, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating playlist", error },
      { status: 500 }
    );
  }
}
