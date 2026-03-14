import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_change_me";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || user.resetOtp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date()) {
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // OTP is valid. Clear it and issue a short-lived reset token (15 mins)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: null,
        resetOtpExpiry: null,
      },
    });

    const resetToken = jwt.sign(
      { userId: user.id, purpose: "password_reset" },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    return NextResponse.json({
      success: true,
      resetToken,
      message: "OTP verified successfully. Please set your new password.",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
