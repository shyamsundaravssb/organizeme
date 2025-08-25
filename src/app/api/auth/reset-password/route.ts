import { NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { token, newPassword } = await request.json();

    // 1. Find the user with the given token and check for expiration
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Password reset token is invalid or has expired." },
        { status: 400 }
      );
    }

    // 2. Validate the new password
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update the user's password and clear the token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Your password has been reset successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: "An error occurred during password reset." },
      { status: 500 }
    );
  }
}
