/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";
import { incidentCatalog } from "@/lib/incident-catalog";
import { generateAiText } from "@/server/ai/provider-router";

// Local realistic fallback replies when API keys are empty
function getLocalCommanderReply(
  role: string,
  incidentTitle: string,
  userMessage: string
): string {
  const msg = userMessage.toLowerCase();
  
  if (role === "CTO") {
    if (msg.includes("eta") || msg.includes("when") || msg.includes("resolve") || msg.includes("fix")) {
      return `Thanks for the update. I need a firm ETA to communicate to the board. They are breathing down my neck about the ${incidentTitle} outage. What is your current confidence level?`;
    }
    if (msg.includes("cause") || msg.includes("why") || msg.includes("reason") || msg.includes("investigat")) {
      return `Okay, so you're focusing on the root cause. Do we know if this is a configuration drift or a hardware failure? Keep me posted as soon as you confirm the layer.`;
    }
    return `Got it. The financial impact is accumulating by the second. Please ensure you are documenting your proof steps in the timeline. Let me know if you need to escalate to other teams.`;
  }
  
  if (role === "Customer") {
    return `Our systems are completely down and we are losing business! This is unacceptable. When will "${incidentTitle}" be resolved? We need this fixed now!`;
  }
  
  if (role === "Security Team") {
    if (msg.includes("isolate") || msg.includes("block") || msg.includes("quarantine") || msg.includes("firewall")) {
      return `Good call. Have we isolated the network interface or suspended the compromised credentials? Let us know if we need to contact legal regarding a breach response.`;
    }
    return `We are auditing the logs on our end. Please verify there are no indicators of lateral movement. Check if any admin API keys or credentials were leaked in Git or public repos.`;
  }
  
  if (role === "Network Team") {
    if (msg.includes("ping") || msg.includes("route") || msg.includes("vlan") || msg.includes("firewall")) {
      return `We checked the core links and they are up. If you think it's a VLAN trunk prune or a firewall block, tell us which switch port or rule ID we need to verify.`;
    }
    return `All core routers seem healthy on our ping tools. Let us know if you find specific packet drops or port blocks that we need to adjust.`;
  }
  
  // Default: Manager
  return `Acknowledged. Focus on gathering proof first before applying any changes. Let me know what your next diagnostic step is so I can update the stakeholders.`;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await dbService.incidentSession.findUnique({
      where: { id },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await dbService.incidentSession.findUnique({ where: { id } });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const template = incidentCatalog.find((i) => i.id === session.id || i.title === session.title);

    const body = await req.json();
    const { action } = body;

    const timeline = [...(session.timeline as any[])];
    const commandsRun = [...(session.commandsRun as any[])];
    const chatHistory = [...(session.chatHistory as any[])];
    const communicationLogs = [...(session.communicationLogs as any[])];

    const updateData: any = {};

    if (action === "tick") {
      const { seconds } = body;
      const t = template || { businessImpact: { financialLossPerMinute: 200 } };
      const lossPerSec = t.businessImpact.financialLossPerMinute / 60;
      
      updateData.timeElapsed = session.timeElapsed + seconds;
      updateData.financialLoss = Math.round(session.financialLoss + (seconds * lossPerSec));
    }
    
    else if (action === "run_command") {
      const { command } = body;
      let output = "";

      // Check if command is matched in our catalog
      const cleanCommand = command.trim();
      const catalogCommands = template?.commands || {};
      
      if (catalogCommands[cleanCommand]) {
        output = catalogCommands[cleanCommand];
      } else {
        // Generate a smart generic response for common commands
        if (cleanCommand.startsWith("ping")) {
          output = `PING ${cleanCommand.split(" ")[1] || "host"} - 56(84) bytes of data.\nRequest timeout for icmp_seq 0\nRequest timeout for icmp_seq 1\n--- ping statistics ---\n2 packets transmitted, 0 received, 100% packet loss`;
        } else if (cleanCommand.startsWith("nslookup")) {
          output = `Server:  10.10.10.1\nAddress:  10.10.10.1#53\n\n** server can't find ${cleanCommand.split(" ")[1] || "host"}: NXDOMAIN`;
        } else if (cleanCommand === "clear" || cleanCommand === "cls") {
          output = "";
        } else {
          output = `bash: ${cleanCommand.split(" ")[0]}: command not found or connection timed out.`;
        }
      }

      commandsRun.push({
        command: cleanCommand,
        output,
        timestamp: new Date().toISOString(),
      });

      timeline.push({
        time: new Date().toISOString(),
        description: `Executed command: "${cleanCommand}"`,
        type: "DIAGNOSTIC",
      });

      updateData.commandsRun = commandsRun;
      updateData.timeline = timeline;

      // Sometimes trigger a message from the CTO if they run 3+ commands
      if (commandsRun.length === 3 && chatHistory.filter(c => c.sender === "CTO").length === 1) {
        const text = `Hey, just checking in. I see you're executing diagnostic tests on the core hosts. Do we have any leads on the root cause yet?`;
        chatHistory.push({
          sender: "CTO",
          role: "CTO",
          text,
          timestamp: new Date().toISOString(),
        });
        timeline.push({
          time: new Date().toISOString(),
          description: `Message received from CTO`,
          type: "COMMUNICATION",
        });
        updateData.chatHistory = chatHistory;
      }
    }
    
    else if (action === "send_message") {
      const { text, commanderRole } = body;
      
      chatHistory.push({
        sender: "Student",
        role: "Engineer",
        text,
        timestamp: new Date().toISOString(),
      });

      timeline.push({
        time: new Date().toISOString(),
        description: `Sent message to ${commanderRole}`,
        type: "COMMUNICATION",
      });

      // Generate AI Commander response
      let replyText = "";
      const systemPrompt = `You are playing the role of the ${commanderRole} in an IT War Room outage simulation inside GuruAI.
The student is an engineer investigating the incident: "${session.title}" (Symptoms: ${session.symptoms}).
The underlying expected Root Cause is: "${session.expectedRca}".
Your character details:
- CTO: Demands quick ETAs for stakeholders. Tense, professional, high expectations.
- Manager: Supportive, coordinates resources, asks for specific files/commands run.
- Customer: Highly frustrated end-user experiencing service interruption.
- Security Team: audit-conscious, requests network isolation, credentials checks.
- Network Team: specialized, questions if you verified subnets and firewall policies.

Reply to the student's message in character. Keep it under 3 sentences. Do not solve the incident for them. Keep the pressure realistic.`;

      const prompt = `Student Message: "${text}"\nHistory of conversation: ${JSON.stringify(chatHistory.slice(-5))}`;

      // Call AI with a fallback check
      try {
        const isApiKeyConfigured = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;
        if (isApiKeyConfigured) {
          replyText = await generateAiText({
            provider: process.env.GEMINI_API_KEY ? "gemini" : process.env.OPENAI_API_KEY ? "openai" : "anthropic",
            system: systemPrompt,
            prompt: prompt,
          });
        }
      } catch (err) {
        console.error("AI response generation failed:", err);
      }

      // Check if we need local fallback
      if (!replyText || replyText.includes("Engineer response: isolate")) {
        replyText = getLocalCommanderReply(
          commanderRole,
          session.title,
          text
        );
      }

      chatHistory.push({
        sender: commanderRole,
        role: commanderRole,
        text: replyText,
        timestamp: new Date().toISOString(),
      });

      timeline.push({
        time: new Date().toISOString(),
        description: `Received message from ${commanderRole}`,
        type: "COMMUNICATION",
      });

      updateData.chatHistory = chatHistory;
      updateData.timeline = timeline;
      updateData.activeCommanderRole = commanderRole;
    }
    
    else if (action === "send_status_update") {
      const { text, target } = body; // target is "CTO", "Customer", "Internal Teams"

      communicationLogs.push({
        target,
        text,
        timestamp: new Date().toISOString(),
      });

      timeline.push({
        time: new Date().toISOString(),
        description: `Broadcasted status update to ${target}`,
        type: "COMMUNICATION",
      });

      updateData.communicationLogs = communicationLogs;
      updateData.timeline = timeline;
    }

    const updatedSession = await dbService.incidentSession.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedSession);
  } catch (error: any) {
    console.error("Failed to update incident session:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
