import { NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import User from "@/models/User";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Generate a secure, expiring token
    const token = crypto.randomBytes(20).toString("hex");
    const tokenExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save the token and its expiration to the user's document
    user.resetPasswordToken = token;
    user.resetPasswordExpires = tokenExpires;
    await user.save();

    // Create the password reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    // Send the email with the reset link
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OrganizeMe: Password Reset Request",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetLink}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Password reset email sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "An error occurred during the password reset process." },
      { status: 500 }
    );
  }
}
