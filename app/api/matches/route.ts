// app/api/matches/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Player } from '@prisma/client'

// 사용자 정의 타입 (입력으로 받는 Player)
type PlayerInput = {
  id: string
  name: string
  mmr: number
}

type MatchRequest = {
  players: PlayerInput[]
  winnerTeam: 'A' | 'B'
}

// 팀 자동 매칭 함수
const autoMatchTeams = (
  players: PlayerInput[]
): { teamA: PlayerInput[]; teamB: PlayerInput[] } => {
  // 플레이어 수가 짝수가 아닐 경우 에러를 throw
  if (players.length % 2 !== 0) {
    throw new Error('플레이어 수는 짝수여야 합니다. 현재 플레이어 수: ' + players.length);
  }

  const n = players.length;
  const half = n / 2;
  let minDiff = Infinity;
  let bestTeamA: PlayerInput[] = [];
  let bestTeamB: PlayerInput[] = [];

  const backtrack = (
    idx: number,
    teamA: PlayerInput[],
    used: boolean[]
  ) => {
    if (teamA.length === half) {
      const teamB = players.filter((_, i) => !used[i]);
      const sumA = teamA.reduce((sum, p) => sum + p.mmr, 0);
      const sumB = teamB.reduce((sum, p) => sum + p.mmr, 0);
      const diff = Math.abs(sumA - sumB);

      if (diff < minDiff) {
        minDiff = diff;
        bestTeamA = [...teamA];
        bestTeamB = [...teamB];
      }
      return;
    }

    for (let i = idx; i < n; i++) {
      if (!used[i]) {
        used[i] = true;
        teamA.push(players[i]);
        backtrack(i + 1, teamA, used);
        teamA.pop();
        used[i] = false;
      }
    }
  };

  backtrack(0, [], Array(n).fill(false));

  return { teamA: bestTeamA, teamB: bestTeamB };
};

// 연승/연패 계산 함수
const checkStreak = async (playerId: string, type: 'win' | 'loss') => {
  const matches = await prisma.gameMatch.findMany({
    where: { playerId },
    orderBy: { date: 'desc' },
    take: 3,
  })

  let streak = 0
  for (const match of matches) {
    if (match.result === type) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// MMR 업데이트 함수
const updateMMR = async (players: PlayerInput[], isWinner: boolean) => {
  const mmrChange = isWinner ? 1 : -1;
  const updatedPlayers: (PlayerInput & { mmrChange: number; newMMR: number })[] = [];

  for (const player of players) {
    const winStreak = await checkStreak(player.id, 'win');
    const lossStreak = await checkStreak(player.id, 'loss');

    let adjustedMMRChange = mmrChange;

    if (player.mmr <= 0) {
      adjustedMMRChange = isWinner ? 1 : -0.5;
    } else {
      if (isWinner) {
        adjustedMMRChange = winStreak >= 2 ? mmrChange - 0.5 : mmrChange;
      } else {
        adjustedMMRChange = lossStreak >= 2 ? mmrChange + 0.5 : mmrChange;
      }
    }

    const newMMR = parseFloat((player.mmr + adjustedMMRChange).toFixed(2));

    console.log(`Player: ${player.name}, Old MMR: ${player.mmr}, Change: ${adjustedMMRChange}, New MMR: ${newMMR}`);

    await prisma.player.update({
      where: { id: player.id },
      data: { mmr: newMMR },
    });

    updatedPlayers.push({
      ...player,
      mmrChange: adjustedMMRChange,
      newMMR,
    });
  }

  return updatedPlayers;
};
// 팀 전투력 계산 함수
const calculateTeamPower = (team: PlayerInput[]) => {
  return team.reduce((total, player) => total + player.mmr, 0);
};

// POST 요청 처리
export async function POST(req: Request) {
  try {
    const { players, winnerTeam }: MatchRequest = await req.json();

    if (winnerTeam !== 'A' && winnerTeam !== 'B') {
      return NextResponse.json({ error: '승리팀이 올바르지 않습니다.' }, { status: 400 });
    }

    const { teamA, teamB } = autoMatchTeams(players);

    // 팀 전투력 계산
    const teamAPower = calculateTeamPower(teamA);
    const teamBPower = calculateTeamPower(teamB);

    // 전투력 차이 계산
    const powerDifference = Math.abs(teamAPower - teamBPower);

    // 공통 matchId 생성
    const matchId = crypto.randomUUID();

    // MMR 업데이트 로직
    const updateAndGetNewMMR = async (player: PlayerInput, isWinner: boolean, isUnderdogWin: boolean) => {
      const mmrChange = isWinner ? 1 : -1;
      const winStreak = await checkStreak(player.id, 'win');
      const lossStreak = await checkStreak(player.id, 'loss');

      let adjustedMMRChange = mmrChange;

      if (player.mmr <= 0) {
        adjustedMMRChange = isWinner ? 1 : -0.5;
      } else {
        if (isWinner) {
          adjustedMMRChange = winStreak >= 2 ? mmrChange - 0.5 : mmrChange;
        } else {
          adjustedMMRChange = lossStreak >= 2 ? mmrChange + 0.5 : mmrChange;
        }
      }

      // 전투력 보정 적용
      if (isUnderdogWin && isWinner) {
        adjustedMMRChange += 1; // 추가 1점 보정 (총 2점)
      }

      const updatedPlayer = await prisma.player.update({
        where: { id: player.id },
        data: { mmr: player.mmr + adjustedMMRChange },
      });

      return {
        mmrChange: adjustedMMRChange,
        newMMR: updatedPlayer.mmr,
      };
    };

    // 팀 A 기록 저장
    for (const player of teamA) {
      const isUnderdogWin = powerDifference >= 3 && winnerTeam === 'A' && teamAPower < teamBPower;
      const { mmrChange, newMMR } = await updateAndGetNewMMR(player, winnerTeam === 'A', isUnderdogWin);
      await prisma.gameMatch.create({
        data: {
          matchId: matchId,
          playerId: player.id,
          result: winnerTeam === 'A' ? 'win' : 'loss',
          team: 'A',
          isWinner: winnerTeam === 'A',
          mmrChange: mmrChange,
          newMMR: newMMR,
          date: new Date(),
        },
      });
    }

    // 팀 B 기록 저장
    for (const player of teamB) {
      const isUnderdogWin = powerDifference >= 3 && winnerTeam === 'B' && teamBPower < teamAPower;
      const { mmrChange, newMMR } = await updateAndGetNewMMR(player, winnerTeam === 'B', isUnderdogWin);
      await prisma.gameMatch.create({
        data: {
          matchId: matchId,
          playerId: player.id,
          result: winnerTeam === 'B' ? 'win' : 'loss',
          team: 'B',
          isWinner: winnerTeam === 'B',
          mmrChange: mmrChange,
          newMMR: newMMR,
          date: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}