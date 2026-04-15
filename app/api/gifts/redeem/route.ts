import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userSession = session?.user as any;

  if (!userSession) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { giftId, type } = body; // type: 'direct' | 'wheel_100' | 'wheel_50'

    // Tìm user bằng email
    const user = await prisma.user.findUnique({
      where: { email: userSession.email },
      select: { id: true, total_points: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    // Xác định số điểm cần trừ
    let pointCost = 0;
    let actionDesc = '';
    let wonGiftId: string | null = null;
    let wonGiftName: string | null = null;
    let wonGiftIndex: number | null = null;
    
    if (type === 'direct') {
      if (!giftId) return NextResponse.json({ error: "Thiếu ID quà tặng" }, { status: 400 });
      const gift = await prisma.gift.findUnique({ where: { id: giftId } });
      if (!gift) return NextResponse.json({ error: "Không tìm thấy quà" }, { status: 404 });
      if (gift.stock <= 0) return NextResponse.json({ error: "Quà đã hết hàng" }, { status: 400 });
      pointCost = gift.pointCost;
      actionDesc = 'redeem_gift';
      wonGiftId = gift.id;
      wonGiftName = gift.name;

    } else if (type === 'wheel_100' || type === 'wheel_50') {
      pointCost = type === 'wheel_100' ? 100 : 50;
      actionDesc = 'spin_wheel';

      // Lấy danh sách quà của vòng quay này (còn tồn kho)
      const wheelGifts = await prisma.gift.findMany({
        where: { 
          pointCost: pointCost,
          isActive: true
        },
        orderBy: { createdAt: 'asc' }
      });

      if (wheelGifts.length === 0) {
        return NextResponse.json({ error: "Không có quà trong vòng quay này" }, { status: 400 });
      }

      // Chọn ngẫu nhiên quà trúng (chỉ từ những quà còn tồn kho)
      const availableGifts = wheelGifts.filter(g => g.stock > 0);
      
      if (availableGifts.length === 0) {
        return NextResponse.json({ error: "Tất cả quà trong vòng quay đã hết hàng" }, { status: 400 });
      }

      const randomIndex = Math.floor(Math.random() * availableGifts.length);
      const wonGift = availableGifts[randomIndex];
      wonGiftId = wonGift.id;
      wonGiftName = wonGift.name;

      // Tìm index trong danh sách đầy đủ (để frontend quay đến đúng vị trí)
      wonGiftIndex = wheelGifts.findIndex(g => g.id === wonGift.id);

    } else {
      return NextResponse.json({ error: "Loại hình không hợp lệ" }, { status: 400 });
    }

    // Kiểm tra đủ điểm
    if (user.total_points < pointCost) {
      return NextResponse.json({ 
        error: `Không đủ điểm. Bạn có ${user.total_points} điểm, cần ${pointCost} điểm.` 
      }, { status: 400 });
    }

    // Trừ điểm user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { total_points: { decrement: pointCost } }
    });

    // Trừ tồn kho quà trúng
    if (wonGiftId) {
      await prisma.gift.update({
        where: { id: wonGiftId },
        data: { stock: { decrement: 1 } }
      });
    }

    // Ghi lại giao dịch
    await prisma.transaction.create({
      data: {
        userId: user.id,
        action: actionDesc,
        pointChange: -pointCost,
        referenceId: wonGiftId
      }
    });

    return NextResponse.json({ 
      success: true, 
      remainingPoints: updatedUser.total_points,
      wonGiftName: wonGiftName,
      wonGiftIndex: wonGiftIndex,
      message: `Đã trừ ${pointCost} điểm. Còn lại: ${updatedUser.total_points} điểm.`
    });
  } catch (error) {
    console.error("Redeem error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi đổi quà" }, { status: 500 });
  }
}
