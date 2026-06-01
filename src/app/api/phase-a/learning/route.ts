import { NextResponse } from "next/server";
import { dailyMission, weakestSkills } from "@/lib/phase-a-data";

export async function GET() {
  return NextResponse.json({ mission: dailyMission, nextSkill: weakestSkills()[0] });
}
