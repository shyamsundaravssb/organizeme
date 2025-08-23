import { NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { email, password } = await request.json();

    // 1. Basic Input Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    // 2. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 3. Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 4. Create a JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // 5. Return the token and user data
    return NextResponse.json(
      {
        message: "Logged in successfully",
        user: {
          name: user.name,
          username: user.username,
        },
        token,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error logging in", error: error.message },
      { status: 500 }
    );
  }
}
