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
      // Return 200 even if user not found to prevent email enumeration
      return NextResponse.json({ success: true, message: "If an account exists, an OTP has been sent." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); // 10 minutes from now

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otp,
        resetOtpExpiry: expiry,
      },
    });

    // Send Email via Resend
    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("PLACEHOLDER")) {
      await resend.emails.send({
        from: "CoreInvent <onboarding@resend.dev>",
        to: user.email,
        subject: "Your Password Reset Code",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #475569; font-size: 16px;">We received a request to reset your password for CoreInvent. Enter the following code to continue:</p>
            <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #4f46e5;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        `,
      });
    } else {
      console.log(`\n===========================================`);
      console.log(`[DEV MODE] OTP for ${user.email} is: ${otp}`);
      console.log(`Missing RESEND_API_KEY. Did not send real email.`);
      console.log(`===========================================\n`);
    }

    return NextResponse.json({ success: true, message: "If an account exists, an OTP has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
