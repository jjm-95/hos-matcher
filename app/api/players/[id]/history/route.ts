// app/api/players/[id]/history/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: any // ✅ 여기서 타입 빼거나 any로 처리
) {
  const playerId = context.params.id;

  try {
    const matches = await prisma.gameMatch.findMany({
      where: { playerId },
      orderBy: { date: "asc" },
      select: {
        date: true,
        newMMR: true,
      },
    });

    return NextResponse.json({
      history: matches.map((match) => match.newMMR),
    });
  } catch (error) {
    console.error("전투력 변동 기록 가져오기 실패:", error);
    return NextResponse.json(
      { error: "전투력 변동 기록을 가져오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}
