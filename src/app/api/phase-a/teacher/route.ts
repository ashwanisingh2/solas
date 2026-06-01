import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { topic, question } = await req.json();
  return NextResponse.json({
    reply: `For ${topic}, think like an engineer: state the symptom, identify the layer, run one proof command, make one controlled change, then write the ticket note. Your question was: "${question}".`,
  });
}
