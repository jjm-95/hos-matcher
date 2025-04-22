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
  if (players.length % 2 !== 0) {
    throw new Error('선수 수는 짝수여야 합니다.')
  }

  players.sort((a, b) => b.mmr - a.mmr)

  const teamA: PlayerInput[] = []
  const teamB: PlayerInput[] = []
  let teamASum = 0
  let teamBSum = 0

  for (const player of players) {
    if (teamASum <= teamBSum) {
      teamA.push(player)
      teamASum += player.mmr
    } else {
      teamB.push(player)
      teamBSum += player.mmr
    }
  }

  return { teamA, teamB }
}

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
  const mmrChange = isWinner ? 1 : -1

  for (const player of players) {
    const winStreak = await checkStreak(player.id, 'win')
    const lossStreak = await checkStreak(player.id, 'loss')

    let adjustedMMRChange = mmrChange

    if (player.mmr <= 0) {
      adjustedMMRChange = isWinner ? 1 : -0.5
    } else {
      if (isWinner) {
        adjustedMMRChange = winStreak >= 2 ? mmrChange - 0.5 : mmrChange
      } else {
        adjustedMMRChange = lossStreak >= 2 ? mmrChange + 0.5 : mmrChange
      }
    }

    await prisma.player.update({
      where: { id: player.id },
      data: {
        mmr: player.mmr + adjustedMMRChange,
      },
    })
  }
}

// POST 요청 처리
export async function POST(req: Request) {
  const { players, winnerTeam }: MatchRequest = await req.json()

  if (winnerTeam !== 'A' && winnerTeam !== 'B') {
    return NextResponse.json({ error: '승리팀이 올바르지 않습니다.' }, { status: 400 })
  }

  const { teamA, teamB } = autoMatchTeams(players)

  await updateMMR(teamA, winnerTeam === 'A')
  await updateMMR(teamB, winnerTeam === 'B')

  for (const player of teamA) {
    await prisma.gameMatch.create({
      data: {
        playerId: player.id,
        result: winnerTeam === 'A' ? 'win' : 'loss',
        team: 'A',
        isWinner: winnerTeam === 'A',
        date: new Date(),
      },
    })
  }

  for (const player of teamB) {
    await prisma.gameMatch.create({
      data: {
        playerId: player.id,
        result: winnerTeam === 'B' ? 'win' : 'loss',
        team: 'B',
        isWinner: winnerTeam === 'B',
        date: new Date(),
      },
    })
  }

  return NextResponse.json({ message: '경기 결과 처리 완료!', teamA, teamB })
}
