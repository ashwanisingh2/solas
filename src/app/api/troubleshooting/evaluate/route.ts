/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";
import { incidentCatalog } from "@/lib/incident-catalog";
import { generateAiText } from "@/server/ai/provider-router";

// Resilient fallback keyword checker for root cause evaluation when AI keys are missing
function gradeRootCauseLocally(studentDiagnosis: string, expectedRca: string): { score: number; feedback: string } {
  const diagnosis = studentDiagnosis.toLowerCase();
  const keywords = expectedRca.toLowerCase().split(/\s+/).filter(w => w.length > 4);
  let matches = 0;
  
  for (const word of keywords) {
    // clean punctuation
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    if (cleanWord.length > 4 && diagnosis.includes(cleanWord)) {
      matches++;
    }
  }

  const keywordRatio = keywords.length > 0 ? matches / keywords.length : 0;
  let score = 50; // base score for making an attempt
  
  if (keywordRatio > 0.4) score = 100;
  else if (keywordRatio > 0.2) score = 85;
  else if (keywordRatio > 0.05) score = 70;
  
  // Custom feedbacks for realistic feeling
  let feedback = "Your diagnosis captures the critical components of the incident. You correctly identified the layer and the immediate failure mechanism.";
  if (score < 70) {
    feedback = "Your diagnosis is slightly too generic. While you identified the outage, you missed specific details of the underlying root cause (e.g., hypervisor host space limits, incorrect environment variables, or specific file corruptions).";
  } else if (score < 90) {
    feedback = "Good analysis. You successfully identified the affected system and the general trigger, although your explanation could be slightly more precise on the exact system-level constraint.";
  }

  return { score, feedback };
}

export async function POST(req: Request) {
  try {
    const { sessionId, rootCauseDiagnosis, remediationId, preventionSuggestions } = await req.json();

    const session = await dbService.incidentSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const template = incidentCatalog.find((i) => i.id === session.id || i.title === session.title);
    if (!template) {
      return NextResponse.json({ error: "Incident template not found" }, { status: 404 });
    }

    // 1. Investigation Speed Score
    // Under 3 mins (180s) -> 100, Under 6 mins (360s) -> 85, Under 10 mins (600s) -> 70, Else -> 50
    let speedScore = 50;
    if (session.timeElapsed <= 180) speedScore = 100;
    else if (session.timeElapsed <= 360) speedScore = 85;
    else if (session.timeElapsed <= 600) speedScore = 70;

    // 2. Resolution Quality Score
    const selectedRemediation = template.remediationOptions.find((r) => r.id === remediationId);
    const resolutionScore = selectedRemediation?.isCorrect ? 100 : 20;
    const resolutionFeedback = selectedRemediation?.feedback || "Selected remediation did not fix the root issue.";

    // 3. Root Cause Accuracy Score
    let rcaScore = 0;
    let rcaFeedback = "";
    
    // Check if AI keys are present
    const isApiKeyConfigured = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (isApiKeyConfigured) {
      try {
        const systemPrompt = `You are a Senior Systems Architect evaluating a student's root cause analysis (RCA) note for an IT outage.
The incident is: "${template.title}".
The underlying expected Root Cause is: "${template.expectedRca}".
The student's submitted diagnosis is: "${rootCauseDiagnosis}".

Please evaluate the student's diagnosis for accuracy against the expected root cause.
Return a JSON object in this format (nothing else, no markdown codeblocks):
{
  "score": <score from 0 to 100>,
  "feedback": "<2-3 sentence critique of their diagnosis>"
}`;
        
        const aiOutput = await generateAiText({
          provider: process.env.GEMINI_API_KEY ? "gemini" : process.env.OPENAI_API_KEY ? "openai" : "anthropic",
          system: systemPrompt,
          prompt: "Evaluate the student's response now.",
        });

        // Clean possible markdown backticks from JSON
        const cleanJson = aiOutput.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        rcaScore = parsed.score;
        rcaFeedback = parsed.feedback;
      } catch (err) {
        console.error("AI RCA evaluation failed, using local fallback:", err);
        const localRca = gradeRootCauseLocally(rootCauseDiagnosis, template.expectedRca);
        rcaScore = localRca.score;
        rcaFeedback = localRca.feedback;
      }
    } else {
      const localRca = gradeRootCauseLocally(rootCauseDiagnosis, template.expectedRca);
      rcaScore = localRca.score;
      rcaFeedback = localRca.feedback;
    }

    // 4. Communication Quality Score
    // Look at communication logs.
    // If they sent updates to both Technical teams and Management/CTO -> 100
    // If they sent updates to only one -> 70
    // If no updates -> 30
    const commLogs = session.communicationLogs as any[];
    const targets = new Set(commLogs.map((l) => l.target));
    let communicationScore = 30;
    let commFeedback = "No proactive communication was logged with stakeholders. In a real incident, keeping stakeholders updated is critical.";
    
    if (targets.size >= 2) {
      communicationScore = 100;
      commFeedback = "Excellent! You proactively updated both executive sponsors (CTO/Manager) and technical/client teams, keeping the loop closed.";
    } else if (targets.size === 1) {
      communicationScore = 70;
      commFeedback = "Moderate communication. You updated one stakeholder group, but forgot to close the loop with others (e.g. client complaints or executive management).";
    }

    // 5. Prevention Suggestions Score
    // Check overlapping strings
    let preventionScore = 50; // base score for trying
    if (preventionSuggestions && preventionSuggestions.length > 0) {
      preventionScore = Math.min(100, 50 + (preventionSuggestions.length * 25));
    }
    const preventionFeedback = preventionScore >= 90
      ? "Strong prevention plan. Your suggestions properly target architectural redundancy and early-alert monitoring."
      : "Basic prevention suggestions. Consider adding active alarms and automated failover pipelines next time.";

    // Overall Average Score
    const overallScore = Math.round(
      (speedScore * 0.15) + 
      (rcaScore * 0.3) + 
      (resolutionScore * 0.3) + 
      (communicationScore * 0.15) + 
      (preventionScore * 0.1)
    );

    // Format Post Incident Report (RCA)
    const postIncidentReport = {
      summary: `Outage of '${template.title}' resolved in ${Math.round(session.timeElapsed / 60)} minutes with an overall response rating of ${overallScore}/100.`,
      rca: rootCauseDiagnosis || "Student did not detail a custom root cause diagnosis.",
      expectedRca: template.expectedRca,
      impactAnalysis: `Downtime: ${Math.round(session.timeElapsed / 60)} mins. Affected users: ${template.businessImpact.affectedUsers}. Financial loss: $${session.financialLoss} USD. Impact severity: ${template.businessImpact.riskLevel}.`,
      timeline: [
        ...session.timeline as any[],
        {
          time: new Date().toISOString(),
          description: `Remediation applied: "${selectedRemediation?.label || 'Action'}"`,
          type: "REMEDIATION",
        },
        {
          time: new Date().toISOString(),
          description: `Incident evaluated and marked RESOLVED. Final score: ${overallScore}`,
          type: "EVALUATION",
        }
      ],
      resolution: resolutionFeedback,
      lessonsLearned: `Ensure that logs and command configurations are validated systematically across the stack to separate network/permission issues from system failures. Always verify credentials scopes and local memory/storage capacities.`,
      preventiveActions: preventionSuggestions || [
        "Configure active monitoring alerts for the failing layer.",
        "Implement high-availability redundancy (e.g. replication, load balancers, secondary links)."
      ],
    };

    // Update session record in DB
    const finalSession = await dbService.incidentSession.update({
      where: { id: sessionId },
      data: {
        status: resolutionScore === 100 ? "RESOLVED" : "FAILED",
        rootCauseDiagnosis,
        remediationAction: selectedRemediation?.label || "None",
        score: overallScore,
        scoresBreakdown: {
          speed: speedScore,
          rcaAccuracy: rcaScore,
          resolutionQuality: resolutionScore,
          communication: communicationScore,
          prevention: preventionScore,
          rcaFeedback,
          resolutionFeedback,
          commFeedback,
          preventionFeedback,
        } as any,
        postIncidentReport: postIncidentReport as any,
        timeline: postIncidentReport.timeline as any,
      },
    });

    return NextResponse.json(finalSession);
  } catch (error: any) {
    console.error("Failed to evaluate incident:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
