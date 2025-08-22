import { NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import bcrypt from "bcryptjs";
import User from "@/models/User";

export async function POST(requset: Request) {
  await dbConnect();

  try {
    const { name, username, email, password } = await requset.json();

    // check if user already exists

    const userExists = await User.findOne({ email });

    if (userExists) {
      return NextResponse.json(
        {
          message: "User with this email already exists",
        },
        {
          status: 409,
        }
      );
    }

    // Hash the password

    const hashedPassword = await bcrypt.hash(password, 10);

    // create a new user

    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    return NextResponse.json(
      {
        message: "User registered successfully",
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Error registering user",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
