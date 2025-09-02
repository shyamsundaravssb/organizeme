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

// GET: Fetches details for a single item
export async function GET(
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

    const item = await Item.findOne({ _id: itemId, owner: user._id });
    if (!item) {
      return NextResponse.json(
        { message: "Item not found or you do not have permission." },
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

// PUT: Updates a single item
export async function PUT(
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
    const { title, url, notes } = await request.json();

    if (!title && !url && !notes) {
      return NextResponse.json(
        { message: "At least one field is required for update." },
        { status: 400 }
      );
    }

    const updatedItem = await Item.findOneAndUpdate(
      { _id: itemId, owner: user._id },
      { title, url, notes },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { message: "Item not found or you do not have permission." },
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

// DELETE: Deletes a single item
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
