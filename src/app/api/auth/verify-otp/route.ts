import { NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import User from "@/models/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { email, otp } = await request.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Check if OTP is correct and has not expired
    if (user.otp === otp && user.otpExpires && user.otpExpires > new Date()) {
      user.isVerified = true;
      user.otp = undefined; // Clear OTP after verification
      user.otpExpires = undefined; // Clear expiration date
      await user.save();
      return NextResponse.json(
        { message: "Email verified successfully!" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Invalid or expired OTP." },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("OTP Verification Error:", error);
    return NextResponse.json(
      { message: "Error verifying OTP.", error: error.message },
      { status: 500 }
    );
  }
}
