// app/api/players/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const players = await prisma.player.findMany()
  return NextResponse.json(players)
}

export async function POST(req: Request) {
  const { name, mmr } = await req.json()

  const player = await prisma.player.create({
    data: {
      name,
      mmr: mmr ?? 5,
    },
  })

  return NextResponse.json(player)
}
