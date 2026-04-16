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

  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch related gifts to show names in "Detail"
    const giftIds = transactions
      .filter(tx => tx.action === 'redeem_gift' || tx.action === 'spin_wheel')
      .map(tx => tx.referenceId)
      .filter(Boolean) as string[];

    const gifts = await prisma.gift.findMany({
      where: { id: { in: giftIds } },
      select: { id: true, name: true }
    });

    const giftMap = Object.fromEntries(gifts.map(g => [g.id, g.name]));

    const transactionsWithDetail = transactions.map(tx => {
      let detail = '-';
      if (tx.action === 'redeem_gift' || tx.action === 'spin_wheel') {
        detail = giftMap[tx.referenceId as string] || 'Quà tặng';
      } else if (tx.action === 'receive_card_thank_you') {
        detail = 'Thank You Card';
      } else if (tx.action === 'receive_card_great_job') {
        detail = 'Great Job Card';
      } else if (tx.action === 'admin_adjustment') {
        detail = 'Điều chỉnh bởi Admin';
      }

      return { ...tx, detail };
    });

    return NextResponse.json(transactionsWithDetail);
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
