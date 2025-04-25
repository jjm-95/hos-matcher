import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 설정값 가져오기
export async function GET() {
  const settings = await prisma.mMRSettings.findFirst();
  console.log("Fetched settings:", settings);
  return NextResponse.json(settings);
}

// POST: 설정값 저장
export async function POST(req: Request) {
  try {
    const newSettings = await req.json();
    console.log("Received settings:", newSettings);

    const existingSettings = await prisma.mMRSettings.findFirst();

    if (existingSettings && existingSettings.id) {
      await prisma.mMRSettings.update({
        where: { id: existingSettings.id },
        data: newSettings,
      });
    } else {
      await prisma.mMRSettings.create({
        data: newSettings,
      });
    }

    // 성공적으로 저장된 경우 JSON 응답 반환
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    // 오류 발생 시 JSON 응답 반환
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}