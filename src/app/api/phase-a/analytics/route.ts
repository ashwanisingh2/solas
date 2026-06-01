import { NextResponse } from "next/server";
import { calculateReadiness, skillGraph, weakestSkills } from "@/lib/phase-a-data";

export async function GET() {
  return NextResponse.json({
    readiness: calculateReadiness(),
    skills: skillGraph,
    weakest: weakestSkills().slice(0, 3),
  });
}
