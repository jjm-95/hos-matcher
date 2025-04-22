// app/api/players/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE 요청 처리
export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;

    if (!id) {
      return NextResponse.json({ error: 'ID가 제공되지 않았습니다.' }, { status: 400 });
    }

    // 데이터베이스에서 해당 ID의 플레이어 삭제
    await prisma.player.delete({
      where: { id },
    });

    return NextResponse.json({ message: '플레이어가 삭제되었습니다.' });
  } catch (error) {
    console.error('DELETE 요청 처리 중 오류:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}