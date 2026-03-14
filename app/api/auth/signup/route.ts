import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const normalizedEmail = email.toLowerCase().trim();

    // Hardcode only one admin per user request
    const role = normalizedEmail === "24bce037@nirmauni.ac.in" ? "Manager" : "Staff";

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = createToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as "Manager" | "Staff",
    });

    await setAuthCookie(token);

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
