import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {

      return NextResponse.json({ success: true, message: "If an account with that email exists, an OTP has been sent." });
    }


    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otp,
        resetOtpExpiry: expiry,
      },
    });

    await resend.emails.send({
      from: "CoreInventory <onboarding@resend.dev>",
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Reset Your Password</h2>
          <p>Hello ${user.name},</p>
          <p>You have requested to reset your password. Here is your One-Time Password (OTP):</p>
          <h1 style="letter-spacing: 4px; background: #f4f4f5; padding: 12px; display: inline-block; border-radius: 8px;">
            ${otp}
          </h1>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
