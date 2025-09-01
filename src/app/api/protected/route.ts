import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/db/dbConnect";
import User from "@/models/User";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      // Corrected: Redirect to login page instead of returning JSON error
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Verify the token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    // Find the user in the database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return the user's data (excluding the password)
    return NextResponse.json(
      {
        message: "Access granted",
        user: {
          name: user.name,
          username: user.username,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
