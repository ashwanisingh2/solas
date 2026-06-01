import { OsModulePage } from "@/components/phase-a/os-module-page";
import { interviewRounds } from "@/lib/os-catalog";

export default function InterviewPage() {
  return (
    <OsModulePage
      eyebrow="Interview Engine"
      title="AI interview simulator"
      description="Technical, HR, scenario, and voice interview modes with structured feedback and readiness scoring."
      items={interviewRounds.map((round) => ({ title: round.type, meta: "AI feedback enabled", detail: round.focus }))}
    />
  );
}
