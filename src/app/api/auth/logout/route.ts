import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear the authentication cookie
    response.cookies.delete("token");

    return response;
  } catch (error) {
    return NextResponse.json({ message: "Error logging out" }, { status: 500 });
  }
}
