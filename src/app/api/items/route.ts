import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/db/dbConnect";
import User from "@/models/User";
import Playlist from "@/models/Playlist";
import Item from "@/models/Item";
import { cookies } from "next/headers";

// Corrected Helper function with dynamic URL and correct type
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

// POST: Create a new item within a playlist
export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const authResult = await getAuthenticatedUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { title, url, notes, parentPlaylistId } = await request.json();
    if (!title || !url || !parentPlaylistId) {
      return NextResponse.json(
        { message: "Title, URL, and Parent Playlist are required." },
        { status: 400 }
      );
    }

    const parentPlaylist = await Playlist.findOne({
      _id: parentPlaylistId,
      owner: user._id,
    });
    if (!parentPlaylist) {
      return NextResponse.json(
        { message: "Parent playlist not found or you do not have permission." },
        { status: 404 }
      );
    }

    const newItem = new Item({
      title,
      url,
      notes,
      parentPlaylist: parentPlaylistId,
      owner: user._id,
    });
    await newItem.save();

    parentPlaylist.children.push(newItem._id);
    await parentPlaylist.save();

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating item", error },
      { status: 500 }
    );
  }
}

// GET: Fetch all items for a specific playlist
// We'll create a dynamic route for this in the next step
