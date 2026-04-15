import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const senderId = (session.user as any).id;
  const userRole = (session.user as any).role;

  try {
    const { receiverId, type, message } = await req.json();

    if (!receiverId || !type || !message) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    // 1. Xác định giá trị điểm và giới hạn
    const pointsMap: Record<string, number> = {
      THANK_YOU: 10,
      GREAT_JOB: 50
    };
    const pointsToDeduct = pointsMap[type];

    // Lấy thông tin quota của user
    const users = await prisma.$queryRaw`SELECT role, thank_you_quota, great_job_quota FROM User WHERE id = ${senderId} LIMIT 1`;
    const userWithQuota = (users as any)[0];

    if (!userWithQuota) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    // 2. Kiểm tra hạn mức trong tháng hiện tại
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const cardsSentThisMonth = await prisma.card.findMany({
      where: {
        senderId,
        type,
        createdAt: { gte: startOfMonth }
      }
    });

    const count = cardsSentThisMonth.length;
    const quota = type === 'THANK_YOU' ? userWithQuota.thank_you_quota : userWithQuota.great_job_quota;

    // Quy tắc phân quyền
    if (userRole === 'ADMIN') {
      // Admin không bị giới hạn
    } else {
      if (type === 'GREAT_JOB' && userRole === 'USER' && userWithQuota.great_job_quota === 0) {
         return NextResponse.json({ error: "Nhân viên không có quyền gửi thẻ Great Job" }, { status: 403 });
      }
      if (count >= quota) {
        return NextResponse.json({ error: `Bạn đã hết lượt gửi thẻ ${type} trong tháng này (Hạn mức: ${quota})` }, { status: 403 });
      }
    }

    // 3. Thực hiện giao dịch (Gửi thẻ + Trừ điểm + Tạo Transaction)
    const result = await prisma.$transaction(async (tx) => {
      // Lưu thẻ
      const card = await tx.card.create({
        data: { senderId, receiverId, type, message }
      });

      // Cộng điểm cho người nhận
      await tx.user.update({
        where: { id: receiverId },
        data: { total_points: { increment: pointsToDeduct } }
      });

      // Tạo lịch sử giao dịch
      await tx.transaction.create({
        data: {
          userId: receiverId,
          action: `receive_card_${type.toLowerCase()}`,
          pointChange: pointsToDeduct,
          referenceId: card.id
        }
      });

      return card;
    });

    return NextResponse.json({ message: "Gửi thẻ thành công!", card: result });
  } catch (error) {
    console.error("Lỗi gửi thẻ:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
