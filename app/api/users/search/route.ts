import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } }
        ],
        NOT: { id: (session.user as any).id }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      take: 5
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Error searching users" }, { status: 500 });
  }
}
