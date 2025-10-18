import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import Item, { IItem } from "@/models/Item";
import Playlist, { IPlaylist } from "@/models/Playlist";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";

// Import sanitization libraries
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

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

    const { itemId } = params;
    const { title, description, notes } = await request.json(); // Get notes from request

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required" },
        { status: 400 }
      );
    }

    // --- ADDED: Sanitize the 'notes' HTML ---
    // Create a JSDOM window to mimic a browser environment for DOMPurify
    const window = new JSDOM("").window;
    const purify = DOMPurify(window as any); // Use 'as any' to satisfy TS types if needed

    // Sanitize the notes content. Allow basic formatting tags.
    const cleanNotes = purify.sanitize(notes || "", {
      USE_PROFILES: { html: true }, // Allows common safe HTML elements (p, strong, em, ul, ol, li, a[href])
    });
    // --- END OF ADDED SECTION ---

    // Update the item using the CLEANED notes
    const updatedItem = await Item.findOneAndUpdate(
      { _id: itemId, owner: user._id },
      { title, description, notes: cleanNotes }, // <-- Use sanitized notes
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { message: "Item not found or permission denied" },
        { status: 404 }
      );
    }

    // Populate and return the updated item (as before)
    const populatedItem = await Item.findById(updatedItem._id).populate<{
      parentPlaylist: IPlaylist;
    }>("parentPlaylist");
    return NextResponse.json(populatedItem, { status: 200 });
  } catch (error) {
    console.error("Error updating item:", error); // Log the error for debugging
    return NextResponse.json(
      { message: "Error updating item", error: (error as Error).message },
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
