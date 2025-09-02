import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/db/dbConnect";
import User from "@/models/User";
import Playlist from "@/models/Playlist";
import Item from "@/models/Item";
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

// GET: Fetches all items for a given playlistId
export async function GET(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  await dbConnect();
  try {
    const authResult = await getAuthenticatedUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { playlistId } = await params;

    const items = await Item.find({
      parentPlaylist: playlistId,
      owner: user._id,
    }).sort({ createdAt: -1 });
    if (!items) {
      return NextResponse.json(
        { message: "No items found for this playlist." },
        { status: 404 }
      );
    }

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching items", error },
      { status: 500 }
    );
  }
}

// POST: Creates a new item within the given playlistId
export async function POST(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  await dbConnect();
  try {
    const authResult = await getAuthenticatedUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { title, url, notes } = await request.json();
    const { playlistId } = await params;

    if (!title || !url || !playlistId) {
      return NextResponse.json(
        { message: "Title, URL, and Parent Playlist are required." },
        { status: 400 }
      );
    }

    // Check if the parent playlist belongs to the authenticated user
    const parentPlaylist = await Playlist.findOne({
      _id: playlistId,
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
      parentPlaylist: playlistId,
      owner: user._id,
    });
    await newItem.save();

    // Add the new item's ID to the parent playlist's children array
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
