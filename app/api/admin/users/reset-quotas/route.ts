import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

async function isAdmin() {
  const session = await getServerSession(authOptions);
  const userSession = session?.user as any;
  if (!userSession) return false;
  return userSession.role === 'ADMIN' || userSession.email === 'admin' || userSession.email === 'support@ncsgroup.vn';
}

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Reset Quotas for all users
    // USER: TY=2, GJ=0
    // LEADER: TY=2, GJ=2
    // ADMIN: TY=999, GJ=999

    // Reset Quotas for all users dùng Raw SQL để tránh lỗi bộ thư viện Prisma cũ
    await prisma.$transaction([
      prisma.$executeRaw`UPDATE User SET thank_you_quota = 2, great_job_quota = 0 WHERE role = 'USER'`,
      prisma.$executeRaw`UPDATE User SET thank_you_quota = 2, great_job_quota = 2 WHERE role = 'LEADER'`,
      prisma.$executeRaw`UPDATE User SET thank_you_quota = 999, great_job_quota = 999 WHERE role = 'ADMIN'`
    ]);

    return NextResponse.json({ message: "Đã làm mới hạn mức cho toàn bộ nhân sự thành công!" });
  } catch (err) {
    console.error("Reset quotas error:", err);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
