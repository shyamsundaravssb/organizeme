import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/db/dbConnect";
import User from "@/models/User";
import Playlist from "@/models/Playlist";
import { cookies } from "next/headers";

// Helper function to get the user from the token from a cookie
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

// PUT: Update a specific playlist
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      // New: Redirect to login page
      return NextResponse.redirect(new URL("/login", "http://localhost:3000/"));
    }
    const { id } = await params;
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    const playlist = await Playlist.findOneAndUpdate(
      { _id: id, owner: user._id },
      { title },
      { new: true }
    );

    if (!playlist) {
      return NextResponse.json(
        {
          message:
            "Playlist not found or you do not have permission to update it.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(playlist, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating playlist", error },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific playlist
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      // New: Redirect to login page
      return NextResponse.redirect(new URL("/login", "http://localhost:3000/"));
    }
    const { id } = await params;

    const playlist = await Playlist.findOneAndDelete({
      _id: id,
      owner: user._id,
    });

    if (!playlist) {
      return NextResponse.json(
        {
          message:
            "Playlist not found or you do not have permission to delete it.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Playlist deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting playlist", error },
      { status: 500 }
    );
  }
}
