import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

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
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

    try {
      // Dùng Raw SQL để né lỗi runtime validation của bộ thư viện Prisma cũ
      const users = await prisma.$queryRaw`
        SELECT id, name, email, role, total_points, thank_you_quota, great_job_quota, createdAt 
        FROM User 
        ORDER BY createdAt DESC
      `;
      return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi lấy danh sách nhân sự" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, role, password, total_points } = body;

    // Kiểm tra email đã tồn tại
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email đã tồn tại" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password || "123456", 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
        total_points: total_points ? parseInt(total_points) : 0,
        thank_you_quota: body.thank_you_quota ? parseInt(body.thank_you_quota) : (role === 'ADMIN' ? 999 : 2),
        great_job_quota: body.great_job_quota ? parseInt(body.great_job_quota) : (role === 'LEADER' ? 2 : 0)
      } as any
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tạo nhân sự" }, { status: 500 });
  }
}
