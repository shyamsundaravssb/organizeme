import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";

// GET: Returns the currently authenticated user's data
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      // It's okay if there's no user, just return null
      return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred.", error },
      { status: 500 }
    );
  }
}
