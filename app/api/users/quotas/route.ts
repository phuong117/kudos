import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const cardsSent = await prisma.card.findMany({
      where: {
        senderId: userId,
        createdAt: { gte: startOfMonth }
      },
      select: { type: true }
    });

    const users = await prisma.$queryRaw`SELECT thank_you_quota, great_job_quota, image FROM User WHERE id = ${userId} LIMIT 1`;
    const user = (users as any)[0];

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const thankYouCount = cardsSent.filter(c => c.type === 'THANK_YOU').length;
    const greatJobCount = cardsSent.filter(c => c.type === 'GREAT_JOB').length;

    let tyRemaining = Math.max(0, user.thank_you_quota - thankYouCount);
    let gjRemaining = Math.max(0, user.great_job_quota - greatJobCount);

    if (userRole === 'ADMIN') {
      tyRemaining = 999;
      gjRemaining = 999;
    }

    return NextResponse.json({
      thankYouRemaining: tyRemaining,
      greatJobRemaining: gjRemaining,
      image: user.image
    });
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
