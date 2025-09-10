import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import User from "@/models/User";

export const getAuthenticatedUser = async () => {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return null; // Return null if no token is found
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.userId).select("-password"); // Exclude password
    return user;
  } catch (error) {
    // This could be due to an expired or invalid token
    return null;
  }
};
