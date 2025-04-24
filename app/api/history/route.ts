// app/api/history/route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { GameMatch } from "@prisma/client";

// player를 포함한 타입 선언
type GameMatchWithPlayer = GameMatch & {
  player: {
    id: string;
    name: string;
  };
};

export async function GET() {
  const matches: GameMatchWithPlayer[] = await prisma.gameMatch.findMany({
    include: { player: true },
    orderBy: { date: 'desc' },
  });

  // ✅ 타입을 GameMatchWithPlayer[]로 지정
  const groupedMatches: Record<string, GameMatchWithPlayer[]> = {};

  for (const match of matches) {
    if (!match.matchId) continue;

    if (!groupedMatches[match.matchId]) {
      groupedMatches[match.matchId] = [];
    }
    groupedMatches[match.matchId].push(match);
  }

  const groupedArray = Object.entries(groupedMatches).map(([matchId, matches]) => {
    const teamA = matches.filter((m) => m.team === 'A').map((m) => ({
      id: m.player.id,
      name: m.player.name,
      team: m.team,
      result: m.result,
      isWinner: m.isWinner,
      mmrChange: m.mmrChange,
      newMMR: m.newMMR,
      matchId: m.matchId,
    }));

    const teamB = matches.filter((m) => m.team === 'B').map((m) => ({
      id: m.player.id,
      name: m.player.name,
      team: m.team,
      result: m.result,
      isWinner: m.isWinner,
      mmrChange: m.mmrChange,
      newMMR: m.newMMR,
      matchId: m.matchId,
    }));

    const winnerTeam = matches.find((m) => m.isWinner)?.team as 'A' | 'B';

    return {
      matchId,
      winnerTeam,
      teamA,
      teamB,
    };
  });
  
  console.log('GameMatch Data:', matches); // 데이터 확인

  return NextResponse.json(groupedArray);
}
