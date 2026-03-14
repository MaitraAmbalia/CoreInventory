import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const sessionUrl = await getCurrentUser();
    if (!sessionUrl) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUrl.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
      from: "CoreInvent <onboarding@resend.dev>",
      to: user.email,
      subject: "Profile Password Change Request",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Change Your Password</h2>
          <p>Hello ${user.name},</p>
          <p>You have requested to change your password from your profile. Here is your One-Time Password (OTP):</p>
          <h1 style="letter-spacing: 4px; background: #f4f4f5; padding: 12px; display: inline-block; border-radius: 8px;">
            ${otp}
          </h1>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request this, please secure your account immediately or ignore this message.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "OTP sent successfully to your registered email" });
  } catch (error) {
    console.error("Profile change password OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
