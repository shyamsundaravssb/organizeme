import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import Item from "@/models/Item";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";

// NEW - GET: Fetch a single item by its ID
export async function GET(
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

    // Find the item and verify ownership
    const item = await Item.findOne({ _id: itemId, owner: user._id });

    if (!item) {
      return NextResponse.json(
        { message: "Item not found or permission denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching item", error },
      { status: 500 }
    );
  }
}

// PUT: Update a specific item
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

    const updatedItem = await Item.findOneAndUpdate(
      { _id: itemId, owner: user._id }, // Security: Ensures you can only update your own items
      { title, description, notes },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { message: "Item not found or permission denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedItem, { status: 200 });
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
