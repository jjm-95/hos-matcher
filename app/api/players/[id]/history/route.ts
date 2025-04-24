// app/api/player/[id]/history/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  const playerId = context.params.id; // 동기적으로 params를 처리

  try {
    // 특정 선수의 전투력 변동 기록 가져오기
    const matches = await prisma.gameMatch.findMany({
      where: { playerId },
      orderBy: { date: "asc" }, // 날짜 기준으로 정렬
      select: {
        date: true,
        newMMR: true,
      },
    });

    // 전투력 변동 기록 반환
    return NextResponse.json({
      history: matches.map((match) => match.newMMR), // 전투력 변동 기록만 반환
    });
  } catch (error) {
    console.error("전투력 변동 기록 가져오기 실패:", error);
    return NextResponse.json(
      { error: "전투력 변동 기록을 가져오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}