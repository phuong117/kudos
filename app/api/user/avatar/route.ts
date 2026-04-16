import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    // Limit size (approx 10MB binary -> ~14MB base64)
    if (image.length > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ảnh quá lớn (tối đa 10MB)' }, { status: 400 });
    }

    // Sử dụng Prisma Client thay vì Raw SQL để tránh lỗi cú pháp với PostgreSQL
    await prisma.user.update({
      where: { email: session.user.email },
      data: { image: image }
    });

    return NextResponse.json({ success: true, image });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
