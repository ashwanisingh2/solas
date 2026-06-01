/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";
import { incidentCatalog } from "@/lib/incident-catalog";

// Helper to ensure a student user exists
async function getOrCreateDefaultUser() {
  let user = await dbService.user.findFirst();
  if (!user) {
    user = await dbService.user.create({
      data: {
        id: "default-student-id",
        supabaseId: "mock-supabase-student-id",
        email: "student@guruai.local",
        name: "Aarav Patel",
        roles: ["STUDENT"],
      },
    });
  }
  return user;
}

export async function POST(req: Request) {
  try {
    const { incidentId, role } = await req.json();

    const template = incidentCatalog.find((i) => i.id === incidentId);
    if (!template) {
      return NextResponse.json({ error: "Incident template not found" }, { status: 404 });
    }

    const user = await getOrCreateDefaultUser();

    // Prepare initial session payload
    const session = await dbService.incidentSession.create({
      data: {
        userId: user.id,
        role: role || template.role,
        title: template.title,
        domain: template.domain,
        symptoms: template.symptoms,
        expectedRca: template.expectedRca,
        status: "INVESTIGATING",
        timeElapsed: 0,
        financialLoss: 0,
        activeCommanderRole: "CTO",
        alerts: template.liveAlerts as any,
        logs: template.systemLogs as any,
        timeline: [
          {
            time: new Date().toISOString(),
            description: `Incident reported: ${template.title}`,
            type: "ALERT",
          },
        ] as any,
        chatHistory: [
          {
            sender: "CTO",
            role: "CTO",
            text: `Hi ${user.name.split(" ")[0]}, we are experiencing a critical outage with "${template.title}". Clients are reporting errors and it's affecting our core service level. Can you look into this immediately?`,
            timestamp: new Date().toISOString(),
          },
        ] as any,
        commandsRun: [] as any,
        communicationLogs: [] as any,
      },
    });

    return NextResponse.json(session);
  } catch (error: any) {
    console.error("Failed to create incident session:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    const sessions = await dbService.incidentSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sessions);
  } catch (error: any) {
    console.error("Failed to list incident sessions:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
