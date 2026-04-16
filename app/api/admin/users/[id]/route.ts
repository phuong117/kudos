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
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, role, total_points } = body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        role,
        total_points: total_points !== undefined ? parseInt(total_points) : undefined,
        thank_you_quota: body.thank_you_quota !== undefined ? parseInt(body.thank_you_quota) : undefined,
        great_job_quota: body.great_job_quota !== undefined ? parseInt(body.great_job_quota) : undefined,
      } as any
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("User PATCH error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật nhân sự" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Không cho phép xóa chính mình
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.id === id) {
      return NextResponse.json({ error: "Không thể tự xóa chính mình" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Đã xóa nhân sự" });
  } catch (error) {
    console.error("User DELETE error:", error);
    return NextResponse.json({ error: "Lỗi xóa nhân sự" }, { status: 500 });
  }
}
