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

export async function GET() {
  try {
    const gifts = await prisma.gift.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(gifts);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi lấy danh sách quà" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, pointCost, stock, type, imageUrl } = body;

    const gift = await prisma.gift.create({
      data: {
        name,
        pointCost: parseInt(pointCost),
        stock: parseInt(stock),
        imageUrl: imageUrl || null
      }
    });

    return NextResponse.json(gift, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tạo quà mới" }, { status: 500 });
  }
}
