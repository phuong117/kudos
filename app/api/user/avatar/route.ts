import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
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

    // Limit size (e.g. 2MB)
    if (image.length > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large (max 2MB)' }, { status: 400 });
    }

    // We use executeRaw to bypass potential Prisma Client staleness if generate failed
    await prisma.$executeRaw`
      UPDATE User 
      SET image = ${image} 
      WHERE email = ${session.user.email}
    `;

    return NextResponse.json({ success: true, image });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
