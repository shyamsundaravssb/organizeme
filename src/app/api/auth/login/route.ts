import { NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(requset: Request) {
  await dbConnect();

  try {
    const { email, password } = await requset.json();

    // Find the user by email

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid Credentials",
        },
        {
          status: 401,
        }
      );
    }

    // compare the provided password with the stored hashed password

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        {
          message: "Invalid Credentials",
        },
        {
          status: 401,
        }
      );
    }

    // Return success message for now (we will add jwt token in a later step)

    return NextResponse.json(
      {
        message: "Logged in successfully",
        user: {
          name: user.name,
          username: user.username,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Error logging in",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
