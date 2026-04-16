import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch related gifts and cards
    const giftIds = transactions
      .filter(tx => tx.action === 'redeem_gift' || tx.action === 'spin_wheel')
      .map(tx => tx.referenceId)
      .filter(Boolean) as string[];

    const cardIds = transactions
      .filter(tx => tx.action.startsWith('receive_card'))
      .map(tx => tx.referenceId)
      .filter(Boolean) as string[];

    const [gifts, cards] = await Promise.all([
      prisma.gift.findMany({
        where: { id: { in: giftIds } },
        select: { id: true, name: true }
      }),
      prisma.card.findMany({
        where: { id: { in: cardIds } },
        select: { id: true, message: true }
      })
    ]);

    const giftMap = Object.fromEntries(gifts.map(g => [g.id, g.name]));
    const cardMap = Object.fromEntries(cards.map(c => [c.id, c.message]));

    const transactionsWithDetail = transactions.map(tx => {
      let detail = '-';
      let message = '-';

      if (tx.action === 'redeem_gift' || tx.action === 'spin_wheel') {
        detail = giftMap[tx.referenceId as string] || 'Quà tặng';
      } else if (tx.action === 'receive_card_thank_you') {
        detail = 'Thank You Card';
        message = cardMap[tx.referenceId as string] || '-';
      } else if (tx.action === 'receive_card_great_job') {
        detail = 'Great Job Card';
        message = cardMap[tx.referenceId as string] || '-';
      } else if (tx.action === 'admin_adjustment') {
        detail = 'Điều chỉnh bởi Admin';
      }

      return { ...tx, detail, message };
    });

    return NextResponse.json(transactionsWithDetail);
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
