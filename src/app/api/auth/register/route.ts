import { NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// Helper function to check for valid username format
const isValidUsername = (username: string) => {
  const usernameRegex = /^[a-z0-9_.]+$/;
  return usernameRegex.test(username);
};

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { name, username, email, password } = await request.json();

    // 1. Basic Input Validation
    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    // 2. Password Length Validation
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // 3. Username Format and Length Validation
    if (
      username.length < 3 ||
      username.length > 20 ||
      !isValidUsername(username.toLowerCase())
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid username format. Must be 3-20 characters long and contain only letters, numbers, underscores, or periods.",
        },
        { status: 400 }
      );
    }

    const sanitizedUsername = username.toLowerCase();

    // 4. Check for existing email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 409 }
      );
    }

    // 5. Check for existing username (case-insensitive)
    const usernameExists = await User.findOne({ username: sanitizedUsername });
    if (usernameExists) {
      return NextResponse.json(
        { message: "This username is already taken." },
        { status: 409 }
      );
    }

    // 6. Hash the password and create the new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      username: sanitizedUsername,
      email,
      password: hashedPassword,
    });
    await user.save();

    return NextResponse.json(
      { message: "User registered successfully!" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error registering user.", error: error.message },
      { status: 500 }
    );
  }
}
