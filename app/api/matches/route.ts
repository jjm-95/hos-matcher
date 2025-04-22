// app/api/matches/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// 팀 자동 매칭 함수
const autoMatchTeams = (players: any[]): { teamA: any[]; teamB: any[] } => {
  // 선수 수가 짝수가 아니면 에러 처리
  if (players.length % 2 !== 0) {
    throw new Error("선수 수는 짝수여야 합니다.");
  }

  // MMR 기준으로 선수 정렬 (내림차순)
  players.sort((a, b) => b.mmr - a.mmr);

  const teamA: any[] = [];
  const teamB: any[] = [];
  let teamASum = 0;
  let teamBSum = 0;

  // 선수들을 하나씩 팀에 배정
  for (const player of players) {
    if (teamASum <= teamBSum) {
      teamA.push(player);
      teamASum += player.mmr;
    } else {
      teamB.push(player);
      teamBSum += player.mmr;
    }
  }

  return { teamA, teamB };
};

// 연승/연패 계산 함수
const checkStreak = async (playerId: string, type: "win" | "loss") => {
  const matches = await prisma.gameMatch.findMany({
    where: { playerId },
    orderBy: { date: "desc" },
    take: 3, // 최근 3경기만 확인
  });

  let streak = 0;
  for (const match of matches) {
    if (match.result === type) {
      streak++;
    } else {
      break; // 연속되지 않으면 중단
    }
  }

  console.log(`Player ${playerId} ${type} streak:`, streak);
  return streak;
};

// MMR 업데이트 함수
const updateMMR = async (players: any[], isWinner: boolean) => {
  const mmrChange = isWinner ? 1 : -1;

  for (const player of players) {
    const winStreak = await checkStreak(player.id, "win");
    const lossStreak = await checkStreak(player.id, "loss");

    let adjustedMMRChange = mmrChange;

    // MMR이 0 이하일 때
    if (player.mmr <= 0) {
      if (isWinner) {
        adjustedMMRChange = 1; // 승리 시 무조건 1 증가
      } else {
        adjustedMMRChange = -0.5; // 패배 시 무조건 0.5 감소
      }
    } else {
      // MMR이 0 초과일 때
      if (isWinner) {
        if (winStreak >= 2) {
          adjustedMMRChange = mmrChange - 0.5; // 2연승 이후부터 보정치 적용
        } else {
          adjustedMMRChange = mmrChange; // 1연승까지는 기본값 유지
        }
      } else {
        if (lossStreak >= 2) {
          adjustedMMRChange = mmrChange + 0.5; // 2연패 이후부터 보정치 적용
        } else {
          adjustedMMRChange = mmrChange; // 기본값 유지
        }
      }
    }

    console.log(`Player ${player.id} winStreak: ${winStreak}, lossStreak: ${lossStreak}`);
    console.log(`Player ${player.id} MMR change: ${adjustedMMRChange}`);

    await prisma.player.update({
      where: { id: player.id },
      data: {
        mmr: player.mmr + adjustedMMRChange,
      },
    });
  }
};

// POST 요청 처리
export async function POST(req: Request) {
  const { players, winnerTeam } = await req.json();

  // winnerTeam이 null인지 확인
  if (winnerTeam !== "A" && winnerTeam !== "B") {
    return NextResponse.json(
      { error: "승리팀이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  // 팀 자동 매칭
  const { teamA, teamB } = autoMatchTeams(players);

  console.log("Team A:", teamA);
  console.log("Team B:", teamB);

  // MMR 업데이트
  await updateMMR(teamA, winnerTeam === "A");
  await updateMMR(teamB, winnerTeam === "B");

  // 경기 결과 저장
  for (const player of teamA) {
    await prisma.gameMatch.create({
      data: {
        playerId: player.id,
        result: winnerTeam === "A" ? "win" : "loss",
        date: new Date(),
        team: "A",
        isWinner: winnerTeam === "A",
      },
    });
  }

  for (const player of teamB) {
    await prisma.gameMatch.create({
      data: {
        playerId: player.id,
        result: winnerTeam === "B" ? "win" : "loss",
        date: new Date(),
        team: "B",
        isWinner: winnerTeam === "B",
      },
    });
  }

  return NextResponse.json({ message: "경기 결과 처리 완료!", teamA, teamB });
}