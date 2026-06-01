import { NextResponse } from "next/server";
import { adminControls, careerTools, companySimulation, incidents, interviewRounds, labCatalog, projectCatalog } from "@/lib/os-catalog";

export async function GET() {
  return NextResponse.json({
    labCatalog,
    incidents,
    companySimulation,
    projectCatalog,
    interviewRounds,
    careerTools,
    adminControls,
  });
}
