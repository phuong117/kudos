import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

async function isAdmin() {
  const session = await getServerSession(authOptions);
  const userSession = session?.user as any;
  
  if (!userSession) return false;
  if (userSession.email === 'support@ncsgroup.vn' || userSession.email === 'admin') return true;
  if (userSession.role === 'ADMIN') return true;
  
  if (userSession.id) {
    const user = await prisma.user.findUnique({
      where: { id: userSession.id },
      select: { role: true }
    });
    if (user?.role === 'ADMIN') return true;
  }
  return false;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, pointCost, stock, isActive } = body;

    const gift = await prisma.gift.update({
      where: { id },
      data: {
        name,
        pointCost: pointCost ? parseInt(pointCost) : undefined,
        stock: stock ? parseInt(stock) : undefined,
        isActive
      }
    });

    return NextResponse.json(gift);
  } catch (error) {
    console.error("Gift PATCH error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật quà" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.gift.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Đã xóa quà" });
  } catch (error) {
    console.error("Gift DELETE error:", error);
    return NextResponse.json({ error: "Lỗi xóa quà" }, { status: 500 });
  }
}
