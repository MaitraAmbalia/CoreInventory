import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireManager } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const manager = await requireManager();
    const { id } = await params;
    const { role } = await request.json();

    if (!role || !["Manager", "Staff"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Attempting to promote to Manager
    if (role === "Manager") {
      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (targetUser?.email !== "24bce037@nirmauni.ac.in") {
          return NextResponse.json({ error: "Only 24bce037@nirmauni.ac.in can be a Manager." }, { status: 403 });
      }
    }

    // Prevent changing own role
    if (id === manager.id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    if (error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Manager access required" }, { status: 403 });
    }
    console.error("User PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const manager = await requireManager();
    const { id } = await params;

    // Prevent deleting oneself
    if (id === manager.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Manager access required" }, { status: 403 });
    }
    console.error("User DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
