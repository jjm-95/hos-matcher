// app/api/players/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id)

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const deleted = await prisma.player.delete({
    where: { id },
  })

  return NextResponse.json(deleted)
}
