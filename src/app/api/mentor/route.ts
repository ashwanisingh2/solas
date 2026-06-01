import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { message } = await req.json();
  const reply = `Mentor: Focus on fundamentals. Next, solve 3 practice questions on: ${message || "your current topic"}.`;
  return NextResponse.json({ reply });
}
