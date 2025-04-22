// app/api/players/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// params 타입을 명시적으로 지정
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params

  try {
    await prisma.player.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Player deleted successfully' })
  } catch (error) {
    console.error('Error deleting player:', error)
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 })
  }
}
