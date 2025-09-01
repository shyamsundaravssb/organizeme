import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/db/dbConnect";
import User from "@/models/User";
import Playlist from "@/models/Playlist";
import { cookies } from "next/headers";

// Helper function to get the user from the token from a cookie
const getAuthenticatedUser = async (request: NextRequest) => {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.userId);
    return user || null;
  } catch (error) {
    return null;
  }
};

// GET: Fetch all playlists for the authenticated user
export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const authResult = await getAuthenticatedUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

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
export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const authResult = await getAuthenticatedUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

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
