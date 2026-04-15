import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "received"; // 'received' | 'sent'

  try {
    const cards = await prisma.card.findMany({
      where: type === 'sent' ? { senderId: userId } : { receiverId: userId },
      include: {
        sender: { select: { name: true, email: true } },
        receiver: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedLog = cards.map(card => {
      const isThankYou = card.type === 'THANK_YOU';
      const points = isThankYou ? 10 : 50;
      return {
        id: card.id,
        type: isThankYou ? 'Thank you card' : 'Great job card',
        fromName: card.sender.name,
        fromEmail: card.sender.email,
        toName: card.receiver.name,
        toEmail: card.receiver.email,
        date: card.createdAt.toISOString(),
        points: points,
        message: card.message
      };
    });

    return NextResponse.json(formattedLog);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json({ error: "Lỗi lịch sử hệ thống" }, { status: 500 });
  }
}
