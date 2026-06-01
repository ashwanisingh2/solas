import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { answer } = await req.json();
  const quality = String(answer || "").length > 80 ? "strong" : "needs-more-evidence";
  const feedback =
    quality === "strong"
      ? "Good engineer response. You included enough evidence to review the troubleshooting path."
      : "Add concrete proof: command used, observed output, likely layer, and next safe action.";
  return NextResponse.json({ quality, feedback });
}
