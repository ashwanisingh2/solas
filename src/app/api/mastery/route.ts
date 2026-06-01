import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { correct, total } = await req.json();
  const score = total ? Math.round((correct / total) * 100) : 0;
  return NextResponse.json({ score, unlocked: score >= 85 });
}
