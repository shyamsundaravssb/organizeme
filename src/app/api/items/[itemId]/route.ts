import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import Item, { IItem } from "@/models/Item";
import Playlist, { IPlaylist } from "@/models/Playlist";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";

// GET: Fetch a single item, handling public/private access
export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  await dbConnect();
  try {
    const { itemId } = await params;
    const user = await getAuthenticatedUser();

    // 1. Find the item and its parent playlist data in one go
    const item = await Item.findById(itemId).populate<{
      parentPlaylist: IPlaylist;
    }>("parentPlaylist");

    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    // 2. Check for access rights
    const isOwner = user && user._id.equals(item.owner);
    if (item.parentPlaylist.visibility === "private" && !isOwner) {
      return NextResponse.json(
        { message: "You do not have permission to view this item" },
        { status: 404 }
      );
    }

    // 3. If parent is public OR the user is the owner, return the item
    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching item", error },
      { status: 500 }
    );
  }
}

// PUT: Update a specific item and return the populated document
export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  await dbConnect();
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;
    const { title, description, notes } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required" },
        { status: 400 }
      );
    }

    // First, update the item
    const updatedItem = await Item.findOneAndUpdate(
      { _id: itemId, owner: user._id },
      { title, description, notes },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { message: "Item not found or permission denied" },
        { status: 404 }
      );
    }

    // Now, find the updated item again to populate its parentPlaylist field
    const populatedItem = await Item.findById(updatedItem._id).populate<{
      parentPlaylist: IPlaylist;
    }>("parentPlaylist");

    // Return the fully populated item
    return NextResponse.json(populatedItem, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating item", error },
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
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;

    const deletedItem = await Item.findOneAndDelete({
      _id: itemId,
      owner: user._id,
    });

    if (!deletedItem) {
      return NextResponse.json(
        { message: "Item not found or permission denied" },
        { status: 404 }
      );
    }

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
