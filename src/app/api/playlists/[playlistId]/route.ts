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

// PUT: Update a specific playlist
export async function PUT(
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
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    const playlist = await Playlist.findOneAndUpdate(
      { _id: playlistId, owner: user._id },
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

    const playlist = await Playlist.findOneAndDelete({
      _id: playlistId,
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
