import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/db/dbConnect";
import User from "@/models/User";
import Playlist from "@/models/Playlist";
import Item from "@/models/Item";
import { cookies } from "next/headers";

// Helper function with dynamic URL
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

// GET: Fetch all items for a specific playlist
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

    // Ensure the playlist belongs to the user
    const playlist = await Playlist.findOne({
      _id: playlistId,
      owner: user._id,
    });
    if (!playlist) {
      return NextResponse.json(
        { message: "Playlist not found or you do not have permission." },
        { status: 404 }
      );
    }

    // Fetch all items with the correct parentPlaylist ID
    const items = await Item.find({
      parentPlaylist: playlistId,
      owner: user._id,
    }).sort({ createdAt: -1 });

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching items", error },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  await dbConnect();
  try {
    const authResult = await getAuthenticatedUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { itemId } = await params;

    // Find and delete the item, ensuring it belongs to the user
    const item = await Item.findOneAndDelete({ _id: itemId, owner: user._id });

    if (!item) {
      return NextResponse.json(
        {
          message: "Item not found or you do not have permission to delete it.",
        },
        { status: 404 }
      );
    }

    // Remove the item's ID from the parent playlist's children array
    await Playlist.findByIdAndUpdate(item.parentPlaylist, {
      $pull: { children: item._id },
    });

    return NextResponse.json(
      { message: "Item deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting item", error },
      { status: 500 }
    );
  }
}
