// app/api/players/[id]/route.ts


import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// DELETE /api/players/[id]
export async function DELETE(
  request: Request,
  context: any //{ params: { id: string } }
) {
  const playerId = context.params.id;

  try {
    await prisma.player.delete({
      where: { id: playerId },
    });

    return NextResponse.json({ message: "플레이어 삭제 성공" }, { status: 200 });
  } catch (error) {
    console.error("플레이어 삭제 실패:", error);
    return NextResponse.json({ error: "플레이어 삭제 실패" }, { status: 500 });
  }
}