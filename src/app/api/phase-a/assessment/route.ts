import { NextResponse } from "next/server";
import { assessmentQuestions } from "@/lib/phase-a-data";

export async function POST(req: Request) {
  const { answers } = await req.json();
  const correct = assessmentQuestions.filter((q) => answers?.[q.id] === q.answer).length;
  const score = Math.round((correct / assessmentQuestions.length) * 100);
  return NextResponse.json({ score, correct, total: assessmentQuestions.length, recommendedStart: score >= 70 ? "lab-prep" : "foundation" });
}
