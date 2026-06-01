import { OsModulePage } from "@/components/phase-a/os-module-page";
import { careerTools } from "@/lib/os-catalog";

export default function CareerPage() {
  return (
    <OsModulePage
      eyebrow="Career Engine"
      title="Job readiness system"
      description="Resume, ATS, LinkedIn, and skill-gap workflows tied to verified engineering evidence."
      items={careerTools.map((tool) => ({ title: tool.title, meta: "Career workflow", detail: tool.metric }))}
    />
  );
}
