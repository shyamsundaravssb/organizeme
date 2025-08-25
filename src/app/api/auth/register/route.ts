import { NextResponse } from "next/server";
import dbConnect from "@/db/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// Helper function to check for valid username format
const isValidUsername = (username: string) => {
  const usernameRegex = /^[a-z0-9_.]+$/;
  return usernameRegex.test(username);
};

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

    // 4. Check for existing email and username
    const userExists = await User.findOne({
      $or: [{ email }, { username: sanitizedUsername }],
    });
    if (userExists) {
      if (userExists.email === email) {
        return NextResponse.json(
          { message: "User with this email already exists." },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          { message: "This username is already taken." },
          { status: 409 }
        );
      }
    }

    // 5. Generate and store OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // OTP expires in 15 minutes

    // 6. Hash the password and create the new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      username: sanitizedUsername,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });
    await user.save();

    // 7. Send the verification email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OrganizeMe: Email Verification",
      text: `Your OTP for OrganizeMe is ${otp}. It will expire in 15 minutes.`,
      html: `<p>Your OTP for OrganizeMe is <strong>${otp}</strong>. It will expire in 15 minutes.</p>`,
    };
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        message:
          "Registration successful! Please check your email for the verification code.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "Error registering user.", error: error.message },
      { status: 500 }
    );
  }
}
